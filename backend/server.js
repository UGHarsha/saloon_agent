import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import multer from 'multer';
import fetch from 'node-fetch';
import FormData from 'form-data';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const upload = multer({ storage: multer.memoryStorage() });

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

const NATURAL_COLOR_PRESETS = {
  blonde: "CAA36B",
  "light brown": "8A5F46",
  brown: "6C4A36",
  "dark brown": "4A3022",
  auburn: "8D3127",
  ginger: "B55A2A",
  black: "2A211E",
  silver: "AEB1B3",
  burgundy: "4D1A1C",
  chestnut: "7B4C37",
  copper: "A6542A",
  red: "8A2D2A",
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function hexToRgb(hex) {
  const normalized = hex.replace('#', '');
  const value = normalized.length === 3
    ? normalized.split('').map((c) => `${c}${c}`).join('')
    : normalized;

  if (!/^[0-9A-Fa-f]{6}$/.test(value)) {
    return null;
  }

  const int = parseInt(value, 16);
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
}

function rgbToHex({ r, g, b }) {
  const toHex = (channel) => channel.toString(16).padStart(2, '0').toUpperCase();
  return `${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function rgbToHsl({ r, g, b }) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === rn) {
      h = ((gn - bn) / delta) % 6;
    } else if (max === gn) {
      h = (bn - rn) / delta + 2;
    } else {
      h = (rn - gn) / delta + 4;
    }
  }

  h = Math.round(h * 60);
  if (h < 0) {
    h += 360;
  }

  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  return { h, s, l };
}

function hslToRgb({ h, s, l }) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let rn = 0;
  let gn = 0;
  let bn = 0;

  if (h >= 0 && h < 60) {
    rn = c;
    gn = x;
  } else if (h >= 60 && h < 120) {
    rn = x;
    gn = c;
  } else if (h >= 120 && h < 180) {
    gn = c;
    bn = x;
  } else if (h >= 180 && h < 240) {
    gn = x;
    bn = c;
  } else if (h >= 240 && h < 300) {
    rn = x;
    bn = c;
  } else {
    rn = c;
    bn = x;
  }

  return {
    r: Math.round((rn + m) * 255),
    g: Math.round((gn + m) * 255),
    b: Math.round((bn + m) * 255),
  };
}

function toNaturalHairHex(inputColor) {
  const raw = String(inputColor || '').trim();
  const lower = raw.toLowerCase();

  const preset = NATURAL_COLOR_PRESETS[lower];
  const resolved = preset || raw;

  const rgb = hexToRgb(resolved);
  if (!rgb) {
    return "8D3127";
  }

  const hsl = rgbToHsl(rgb);

  // Keep shades realistic for hair fibers: moderate saturation and protected highlights.
  const adjusted = {
    h: hsl.h,
    s: clamp(hsl.s, 0.15, 0.58),
    l: clamp(hsl.l, 0.13, 0.66),
  };

  // Very bright yellows often look "painted" on hair, so soften them.
  if (adjusted.h >= 35 && adjusted.h <= 58 && adjusted.l > 0.58) {
    adjusted.s = clamp(adjusted.s - 0.1, 0.15, 0.5);
    adjusted.l = 0.58;
  }

  return rgbToHex(hslToRgb(adjusted));
}

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

function getPicsartApiKey() {
  const candidates = [
    process.env.PICSART_API_KEY,
    process.env.NEXT_PUBLIC_PICSART_API_KEY,
    process.env.PICSART_KEY,
  ];

  const resolved = candidates.find((value) => typeof value === 'string' && value.trim().length > 0);
  return resolved ? resolved.trim() : '';
}

function extractErrorReason(parsedBody, rawBody, status, statusText) {
  const candidates = [
    parsedBody?.message,
    parsedBody?.error,
    parsedBody?.details,
    parsedBody?.detail,
    parsedBody?.errors?.[0]?.message,
    parsedBody?.data?.message,
    parsedBody?.data?.error,
    rawBody,
  ];

  const reason = candidates.find((value) => typeof value === 'string' && value.trim().length > 0);
  if (reason) {
    return reason.slice(0, 400);
  }

  return `${status} ${statusText}`;
}

function findFirstHttpUrl(payload, depth = 0) {
  if (depth > 8 || payload == null) {
    return null;
  }

  if (typeof payload === 'string') {
    return /^https?:\/\//i.test(payload) ? payload : null;
  }

  if (Array.isArray(payload)) {
    for (const item of payload) {
      const found = findFirstHttpUrl(item, depth + 1);
      if (found) {
        return found;
      }
    }
    return null;
  }

  if (typeof payload === 'object') {
    const prioritizedKeys = ['url', 'image_url', 'result_url', 'output_url', 'src'];
    for (const key of prioritizedKeys) {
      if (key in payload) {
        const found = findFirstHttpUrl(payload[key], depth + 1);
        if (found) {
          return found;
        }
      }
    }

    for (const value of Object.values(payload)) {
      const found = findFirstHttpUrl(value, depth + 1);
      if (found) {
        return found;
      }
    }
  }

  return null;
}

function extractInferenceId(payload) {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  return (
    payload?.inference_id ||
    payload?.transaction_id ||
    payload?.id ||
    payload?.data?.inference_id ||
    payload?.data?.transaction_id ||
    payload?.result?.inference_id ||
    null
  );
}

async function pollPaintingResult(inferenceId, picsartApiKey) {
  const maxAttempts = 20;
  const baseDelayMs = 1500;
  const processingStates = new Set(['processing', 'queued', 'pending', 'running', 'in_progress']);

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const pollResponse = await fetch(`https://genai-api.picsart.io/v1/painting/${inferenceId}`, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'X-Picsart-API-Key': picsartApiKey,
      },
    });

    const pollRaw = await pollResponse.text();
    let pollParsed = null;
    try {
      pollParsed = pollRaw ? JSON.parse(pollRaw) : null;
    } catch {
      pollParsed = null;
    }

    const pollUrl =
      pollParsed?.data?.[0]?.url ||
      pollParsed?.images?.[0]?.url ||
      pollParsed?.image?.url ||
      findFirstHttpUrl(pollParsed);

    if (pollUrl) {
      return pollUrl;
    }

    const apiStatus = String(
      pollParsed?.status || pollParsed?.data?.status || pollParsed?.result?.status || ''
    ).toLowerCase();
    const progress = typeof pollParsed?.progress === 'number'
      ? pollParsed.progress
      : (typeof pollParsed?.data?.progress === 'number' ? pollParsed.data.progress : null);

    const isProcessing = pollResponse.status === 202 || processingStates.has(apiStatus);
    const isTransientServerIssue = [429, 500, 502, 503, 504].includes(pollResponse.status);

    if ((isProcessing || isTransientServerIssue) && attempt < maxAttempts) {
      const delayMs = baseDelayMs + Math.min((attempt - 1) * 250, 2500);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      continue;
    }

    if (isProcessing && attempt >= maxAttempts) {
      const statusLabel = apiStatus || 'processing';
      const progressLabel = progress == null ? 'unknown' : `${progress}%`;
      throw new Error(
        `Picsart polling timed out after ${maxAttempts} checks (status: ${statusLabel}, progress: ${progressLabel}).`
      );
    }

    const reason = extractErrorReason(pollParsed, pollRaw, pollResponse.status, pollResponse.statusText);
    throw new Error(`Picsart polling ${pollResponse.status}: ${reason}`);
  }

  throw new Error('Picsart result polling timed out. Please try again.');
}

async function runPicsartRecolor(file, naturalTargetColorHex, picsartApiKey) {
  const prompt = `Change only the person's hair color to #${naturalTargetColorHex}. Keep skin tone, face shape, background, clothing, and hairstyle unchanged. Make it photorealistic.`;

  const form = new FormData();
  form.append('image', file.buffer, {
    filename: file.originalname || 'upload.jpg',
    contentType: file.mimetype,
  });
  form.append('prompt', prompt);
  form.append('count', '1');
  form.append('format', 'PNG');

  const picsartResponse = await fetch('https://genai-api.picsart.io/v1/painting/edit?mode=sync', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'X-Picsart-API-Key': picsartApiKey,
      ...form.getHeaders(),
    },
    body: form,
  });

  const rawBody = await picsartResponse.text();
  let parsedBody = null;
  try {
    parsedBody = rawBody ? JSON.parse(rawBody) : null;
  } catch {
    parsedBody = null;
  }

  const recoloredImageUrl =
    parsedBody?.data?.[0]?.url ||
    parsedBody?.images?.[0]?.url ||
    parsedBody?.image?.url ||
    parsedBody?.url ||
    findFirstHttpUrl(parsedBody) ||
    null;

  if (recoloredImageUrl) {
    return recoloredImageUrl;
  }

  const inferenceId = extractInferenceId(parsedBody);
  if (inferenceId && (picsartResponse.status === 202 || picsartResponse.ok)) {
    return pollPaintingResult(inferenceId, picsartApiKey);
  }

  const reason = extractErrorReason(parsedBody, rawBody, picsartResponse.status, picsartResponse.statusText);
  throw new Error(`Picsart ${picsartResponse.status}: ${reason}`);
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

app.post('/api/recolor-hair', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const picsartApiKey = getPicsartApiKey();
    if (!picsartApiKey) {
      return res.status(500).json({
        error: 'Picsart API key is missing in backend environment. Set PICSART_API_KEY in backend/.env and restart backend.',
      });
    }
    
    const targetColorHex = req.body.color || "8D3127";
    const naturalTargetColorHex = toNaturalHairHex(targetColorHex);

    console.log(`Processing hair recolor request to Hex: ${targetColorHex} (naturalized: ${naturalTargetColorHex}) with Picsart...`);

    let recoloredImageUrl = null;
    try {
      recoloredImageUrl = await runPicsartRecolor(req.file, naturalTargetColorHex, picsartApiKey);
    } catch (picsartError) {
      const reason = picsartError instanceof Error ? picsartError.message : 'Unknown Picsart failure';
      console.error('Picsart API Error:', reason);
      return res.status(502).json({
        error: 'Picsart failed to process the image.',
        details: reason,
      });
    }

    const originalDataURI = "data:" + req.file.mimetype + ";base64," + req.file.buffer.toString("base64");

    res.json({
      originalUrl: originalDataURI,
      recoloredUrl: recoloredImageUrl,
      appliedColor: naturalTargetColorHex,
      provider: 'picsart',
    });
  } catch (error) {
    console.error("Recolor Error:", error);
    res.status(500).json({ error: "Failed to recolor image" });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
