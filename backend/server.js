import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

const genAI = new GoogleGenAI({
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || "",
});

function extractAppointmentDetails(message, history) {
  const fullConversation = [...(history || []).map((msg) => msg.text), message].join(" ");

  const details = {};

  if (fullConversation.toLowerCase().includes("haircut") || fullConversation.toLowerCase().includes("hair cut")) {
    details.service = "Haircut";
  } else if (fullConversation.toLowerCase().includes("coloring")) {
    details.service = "Coloring";
  }

  const timeMatch = fullConversation.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)?/i);
  if (timeMatch) {
    details.appointmentTime = timeMatch[0];
  }

  const nameMatch = fullConversation.match(/(?:my name is|name is|name:\s*|i'm|i am|im|call me|this is)\s*([A-Za-z]+)/i);
  if (nameMatch) {
    details.customerName = nameMatch[1];
  }

  return details;
}

app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      return res.status(500).json({ error: "API key not configured." });
    }

    const appointmentDetails = extractAppointmentDetails(message, history || []);

    const bookingKeywords = ["confirm", "book", "schedule", "yes", "okay", "sure", "perfect", "sounds good"];
    const shouldBook = bookingKeywords.some((keyword) => message.toLowerCase().includes(keyword));

    if (shouldBook && appointmentDetails.service) {
      try {
        const today = new Date().toISOString().split('T')[0];

        const bookingData = {
          customer_name: appointmentDetails.customerName || "Guest",
          service: appointmentDetails.service,
          appointment_date: today,
        };

        console.log("Saving appointment to Supabase:", bookingData);
        console.log("Supabase config check (URL):", !!process.env.NEXT_PUBLIC_SUPABASE_URL);

        const { data, error } = await supabase.from("bookings").insert([bookingData]).select();

        if (error) {
          console.error("Supabase error:", error);
        } else {
          console.log("Appointment saved successfully:", data);
        }
      } catch (dbError) {
        console.error("Database error:", dbError);
      }
    } else {
      console.log("Booking conditions not met:", { shouldBook, service: appointmentDetails.service, message });
    }

    const contents = history && history.length > 0
      ? [
          ...history.map((msg) => ({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.text }],
          })),
          {
            role: "user",
            parts: [{ text: message }],
          },
        ]
      : message;

    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        systemInstruction: "You are Bella, the AI receptionist for Royal Glow Salon. Be friendly and professional. Prices: Haircut $30, Coloring $85. Help users book appointments. Remember what the customer has told you in this conversation and don't ask the same questions again. When they confirm their booking, summarize their appointment details clearly.",
      },
    });

    const responseText = result?.text || "I'm having trouble processing your request.";
    res.json({
      text: responseText,
      appointmentDetails: shouldBook ? appointmentDetails : null,
    });
  } catch (error) {
    console.error("Chat API Error:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
