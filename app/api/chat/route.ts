import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });

export async function POST(req: Request) {
  const { message } = await req.json();
  
  // Set the "System Instruction" to give the agent its personality
  const result = await genAI.models.generateContent({ 
    model: "gemini-2.5-flash",
    contents: message,
    config: {
      systemInstruction: "You are 'Bella', the AI receptionist for Royal Glow Salon. You are friendly, professional, and helpful. You know our prices: Haircut $30, Coloring $85. Always try to help the user book a time.",
    }
  });
  
  return NextResponse.json({ text: result.text });
}