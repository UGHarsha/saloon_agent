import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

// ✅ Correct initialization
const genAI = new GoogleGenAI({
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || "", // Use the env variable that's set
});

// Function to extract appointment details from conversation
function extractAppointmentDetails(
  message: string,
  history: Array<{ role: string; text: string }>
): {
  service?: string;
  appointmentTime?: string;
  customerName?: string;
} {
  const fullConversation = [
    ...(history || []).map((msg) => msg.text),
    message,
  ].join(" ");

  const details: {
    service?: string;
    appointmentTime?: string;
    customerName?: string;
  } = {};

  // Extract service
  if (
    fullConversation.toLowerCase().includes("haircut") ||
    fullConversation.toLowerCase().includes("hair cut")
  ) {
    details.service = "Haircut";
  } else if (fullConversation.toLowerCase().includes("coloring")) {
    details.service = "Coloring";
  }

  // Extract time (e.g., "10 am", "10:00", "10:30 am")
  const timeMatch = fullConversation.match(
    /(\d{1,2}):?(\d{2})?\s*(am|pm)?/i
  );
  if (timeMatch) {
    details.appointmentTime = timeMatch[0];
  }

  // Extract name (after "my name" or "name is")
  const nameMatch = fullConversation.match(
    /(?:my name is|name is|i'm|i am|im|call me|this is)\s+([A-Za-z]+)/i
  );
  if (nameMatch) {
    details.customerName = nameMatch[1];
  }

  return details;
}

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    // Check if API key is set
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      console.error("Missing API key");
      return NextResponse.json(
        { error: "API key not configured. Please add GEMINI_API_KEY to .env.local" },
        { status: 500 }
      );
    }

    // Extract appointment details from conversation
    const appointmentDetails = extractAppointmentDetails(message, history || []);

    // ✅ Save booking if user confirms
    const bookingKeywords = ["confirm", "book", "schedule", "yes", "okay", "sure", "perfect", "sounds good"];
    const shouldBook = bookingKeywords.some((keyword) =>
      message.toLowerCase().includes(keyword)
    );

    if (shouldBook && appointmentDetails.service) {
      try {
        // Get today's date in ISO format
        const today = new Date().toISOString().split('T')[0];
        
        const bookingData = {
          customer_name: appointmentDetails.customerName || "Guest",
          service: appointmentDetails.service,
          appointment_date: today,
        };

        console.log("Saving appointment:", bookingData);
        console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
        console.log("Supabase Key present:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

        const { data, error } = await supabase
          .from("bookings")
          .insert([bookingData])
          .select();

        if (error) {
          console.error("Supabase insert error:", error);
          console.error("Error details:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
          });
        } else {
          console.log("Appointment saved successfully:", data);
        }
      } catch (dbError) {
        console.error("Database error:", dbError);
      }
    } else {
      console.log("Booking conditions not met:", {
        shouldBook,
        hasService: !!appointmentDetails.service,
        bookingKeywords: ["confirm", "book", "schedule", "yes please", "okay"],
        messageIncludes: bookingKeywords.filter((kw) => message.toLowerCase().includes(kw)),
      });
    }

    // ✅ Build conversation history for context
    const contents = history && history.length > 0
      ? [
          ...history.map((msg: { role: string; text: string }) => ({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.text }],
          })),
          {
            role: "user",
            parts: [{ text: message }],
          },
        ]
      : message;

    // ✅ Generate AI response with context
    try {
      const result = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents,
        config: {
          systemInstruction:
            "You are Bella, the AI receptionist for Royal Glow Salon. Be friendly and professional. Prices: Haircut $30, Coloring $85. Help users book appointments. Remember what the customer has told you in this conversation and don't ask the same questions again. When they confirm their booking, summarize their appointment details clearly.",
        },
      });

      // Extract text from response
      const responseText = result?.text || "I'm having trouble processing your request. Please try again.";

      return NextResponse.json({
        text: responseText,
        appointmentDetails: shouldBook ? appointmentDetails : null,
      });
    } catch (apiError) {
      console.error("Gemini API Error:", apiError);
      
      // Check if it's a quota error
      const errorStatus = (apiError as { status?: number })?.status;
      if (errorStatus === 429) {
        return NextResponse.json(
          { error: "The AI service is temporarily unavailable due to rate limits. Please try again in a moment." },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: "Failed to get AI response. Please try again." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}