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
const rawSupabaseUrl = (
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  process.env.SUPABASE_REST_URL ||
  ''
).trim();
const rawSupabaseAnonKey = (
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_KEY ||
  ''
).trim();
const hasSupabaseConfig = /^https?:\/\//i.test(rawSupabaseUrl) && rawSupabaseAnonKey && !/^your_supabase_/i.test(rawSupabaseUrl) && !/^your_supabase_/i.test(rawSupabaseAnonKey);
console.log('Supabase config check:', { hasSupabaseConfig, rawSupabaseUrl: rawSupabaseUrl ? `${rawSupabaseUrl.slice(0, 60)}...` : '(empty)', anonKeySet: !!rawSupabaseAnonKey });
const inMemoryBookings = [];

const app = express();
app.use(cors());
app.use(express.json());

function missingUserIdColumn(message) {
  const msg = String(message || '').toLowerCase();
  return msg.includes('user_id') && (msg.includes('schema cache') || msg.includes('does not exist'));
}

function buildSupabaseClient(accessToken) {
  if (!hasSupabaseConfig) {
    return null;
  }

  const clientOptions = accessToken
    ? {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    }
    : undefined;

  return createClient(rawSupabaseUrl, rawSupabaseAnonKey, clientOptions);
}

const supabase = buildSupabaseClient();

function getRequestSupabase(accessToken) {
  if (!hasSupabaseConfig) {
    return null;
  }

  if (!accessToken) return supabase;

  return buildSupabaseClient(accessToken);
}

async function listBookingsInRange(windowStart, windowEnd, accessToken) {
  if (!hasSupabaseConfig) {
    return inMemoryBookings.filter((booking) => booking.appointment_date >= windowStart && booking.appointment_date <= windowEnd);
  }

  const client = getRequestSupabase(accessToken);
  const { data, error } = await client
    .from('bookings')
    .select('appointment_date, service')
    .gte('appointment_date', windowStart)
    .lte('appointment_date', windowEnd);

  if (error) {
    throw error;
  }

  return data || [];
}

async function saveBooking(bookingData, accessToken) {
  if (!hasSupabaseConfig) {
    const savedBooking = {
      id: Date.now(),
      ...bookingData,
    };

    inMemoryBookings.push(savedBooking);
    return { data: [savedBooking], error: null };
  }

  const client = getRequestSupabase(accessToken);
  let { data, error } = await client.from('bookings').insert([bookingData]).select();

  if (error && bookingData.user_id && missingUserIdColumn(error.message)) {
    const fallbackBookingData = { ...bookingData };
    delete fallbackBookingData.user_id;
    ({ data, error } = await client.from('bookings').insert([fallbackBookingData]).select());
  }

  return { data, error };
}

const genAI = new GoogleGenAI({
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "",
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
  const userHistory = (history || []).filter((msg) => msg?.role === 'user');
  const fullConversation = [...userHistory.map((msg) => msg.text), message].join(" ");
  const lowerConversation = fullConversation.toLowerCase();
  const cleanMessage = String(message || '').trim();
  const cleanMessageLower = cleanMessage.toLowerCase();

  const details = {};

  if (lowerConversation.includes("adult buzz cut") || lowerConversation.includes("buzz cut")) {
    details.service = "Adult Buzz Cut 60 min (Rs. 5000+)";
  } else if (lowerConversation.includes("clean up") || lowerConversation.includes("beard") || lowerConversation.includes("neck trim")) {
    details.service = "Clean Up - Beard & Neck Trim 15 min (Rs. 2500+)";
  } else if (lowerConversation.includes("gent hair cut") || lowerConversation.includes("gent's haircut")) {
    details.service = "Gent hair cut 30 min (Rs. 4000+)";
  } else if (lowerConversation.includes("women's haircut") || lowerConversation.includes("women's hair cut")) {
    details.service = "Women's Haircut 60 min (Rs. 6000+)";
  } else if (lowerConversation.includes("keratin")) {
    details.service = "Keratin Treatment 120 min (Rs. 25000+)";
  } else if (lowerConversation.includes("bridal") || lowerConversation.includes("wedding")) {
    details.service = "Bridal Package 180 min (Rs. 50000+)";
  } else if (lowerConversation.includes("color") || lowerConversation.includes("colour") || lowerConversation.includes("highlight")) {
    // Determine if men's or women's color
    if (lowerConversation.includes("men")) {
      details.service = "Color & Highlights 60 min (Rs. 10000+)";
    } else {
      details.service = "Color & Highlights 120 min (Rs. 15000+)";
    }
  } else if (lowerConversation.includes("consultation")) {
    if (lowerConversation.includes("women")) {
      details.service = "Consultation 30 min (Rs. 2000)";
    } else {
      details.service = "Consultation 15 min (Rs. 2000)";
    }
  } else if (lowerConversation.includes("haircut") || lowerConversation.includes("hair cut") || lowerConversation.includes("trim")) {
    details.service = "Gent hair cut 30 min (Rs. 4000+)"; // Default to gent if not specified
  }

  // Very basic extraction of "tomorrow", dates, and times
  const timeMatch = fullConversation.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)?/i);
  if (timeMatch) {
    details.appointmentTime = timeMatch[0];
  }

  if (lowerConversation.includes("tomorrow")) {
    const tmrw = new Date();
    tmrw.setDate(tmrw.getDate() + 1);
    details.appointmentDate = tmrw.toISOString().split('T')[0];
  } else {
    details.appointmentDate = new Date().toISOString().split('T')[0];
  }

  const nameMatch = fullConversation.match(/(?:my name is|name is|name:\s*|i'm|i am|im|call me|this is)\s*([A-Za-z]+(?:\s+[A-Za-z]+){0,2})/i);
  if (nameMatch) {
    details.customerName = nameMatch[1].trim();
  } else {
    const plainNameMatch = cleanMessage.match(/^[A-Za-z]+(?:\s+[A-Za-z]+){0,2}$/);
    const commonNonNameTokens = new Set([
      'haircut', 'hair cut', 'trim', 'color', 'colour', 'coloring', 'book', 'booking', 'schedule',
      'yes', 'no', 'okay', 'ok', 'sure', 'tomorrow', 'today', 'tonight', 'morning', 'evening',
    ]);

    if (
      plainNameMatch &&
      cleanMessage.length >= 2 &&
      !commonNonNameTokens.has(cleanMessageLower)
    ) {
      details.customerName = cleanMessage;
    }
  }

  return details;
}

function buildFallbackChatReply({ shouldBook, appointmentDetails, bookingSaved, bookingError }) {
  if (shouldBook && bookingSaved) {
    const service = appointmentDetails?.service || 'service';
    const name = appointmentDetails?.customerName || 'Guest';
    const date = appointmentDetails?.appointmentDate || new Date().toISOString().split('T')[0];
    return `Perfect, ${name}! Your ${service} appointment is booked for ${date}.`;
  }

  if (shouldBook && !appointmentDetails?.service) {
    return "I can book that for you—would you like Haircut & Styling, Color & Highlights, Keratin Treatment, or a Bridal Package?";
  }

  if (!appointmentDetails?.service) {
    return "Got it. Which service would you like to book: Haircut & Styling, Color & Highlights, Keratin Treatment, or a Bridal Package?";
  }

  if (!appointmentDetails?.customerName) {
    return `Great choice—${appointmentDetails.service}. May I have your name for the booking?`;
  }

  if (!shouldBook) {
    return `Thanks, ${appointmentDetails.customerName}. I have ${appointmentDetails.service}. Reply with "book" or "confirm" and I'll save your appointment for today.`;
  }

  if (shouldBook && bookingError) {
    return `I understood your booking request, but I couldn't save it right now (${bookingError}). Please try again in a moment.`;
  }

  return "I can help with bookings—tell me your service and name, then say confirm.";
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

const PROMPT_TEMPLATE = `You are Bella, a sophisticated AI receptionist for a luxury salon in Sri Lanka. 
You ONLY handle salon-related queries. NEVER break character.
If asked about topics outside salon services (e.g., coding, politics, recipes, general facts), politely guide the conversation back to the salon.

IMPORTANT BOOKING RULES:
1. To book an appointment, you MUST output a JSON block wrapped in \`\`\`json ... \`\`\`.
2. The user must provide a CATEGORY (Men/Women), a SERVICE, a DATE, and a TIME before you output the JSON.
3. Once all details are gathered, output the final JSON in exactly this format WITHOUT asking if they want anything else:
\`\`\`json
{
  "book": true,
  "service": "[Exact Service Name]",
  "appointmentDate": "YYYY-MM-DD",
  "appointmentTime": "HH:MM AM/PM"
}
\`\`\`

Here is our exact price list in LKR. Use ONLY these services and amounts when booking:

MEN'S SERVICES:
1. Adult Buzz Cut 60 min - Rs. 5000+
2. Clean Up - Beard & Neck Trim 15 min - Rs. 2500+
3. Gent hair cut 30 min - Rs. 4000+
4. Color & Highlights 60 min - Rs. 10000+
5. Consultation 15 min - Rs. 2000

WOMEN'S SERVICES:
1. Women's Haircut 60 min - Rs. 6000+
2. Color & Highlights 120 min - Rs. 15000+
3. Keratin Treatment 120 min - Rs. 25000+
4. Bridal Package 180 min - Rs. 50000+
5. Consultation 30 min - Rs. 2000

When asked about prices, always ask first if they are looking for Men's or Women's services, then show the corresponding list.
When outputting JSON, ensure the service name matches the list above perfectly.


Conversation History:
{HISTORY}

User: {USER_INPUT}
Bella:`;

app.post('/api/chat', async (req, res) => {
  try {
    const { message, history, userId, userEmail, accessToken } = req.body;
    const safeMessage = typeof message === 'string' ? message.trim() : '';
    const safeHistory = Array.isArray(history)
      ? history.filter((msg) => msg && typeof msg.text === 'string' && typeof msg.role === 'string')
      : [];
    const safeUserId = typeof userId === 'string' ? userId.trim() : '';
    const safeUserEmail = typeof userEmail === 'string' ? userEmail.trim() : '';
    const safeAccessToken = typeof accessToken === 'string' ? accessToken.trim() : '';

    if (!safeMessage) {
      return res.status(400).json({ error: "Message is required." });
    }

    const appointmentDetails = extractAppointmentDetails(safeMessage, safeHistory);

    const bookingKeywords = ["confirm", "book", "schedule", "yes", "okay", "sure", "perfect", "sounds good"];
    const userConversationText = [
      ...safeHistory.filter((msg) => msg.role === 'user').map((msg) => msg.text),
      safeMessage,
    ].join(' ').toLowerCase();
    const shouldBook = bookingKeywords.some((keyword) => userConversationText.includes(keyword));
    let bookingSaved = false;
    let bookingError = null;

    if (shouldBook && appointmentDetails.service) {
      try {
        let dateTimeString = appointmentDetails.appointmentDate || new Date().toISOString().split('T')[0];
        if (appointmentDetails.appointmentTime) {
          try {
            // Rough conversion from 2pm to 14:00:00
            const strTime = appointmentDetails.appointmentTime.toLowerCase();
            const timeMatch = strTime.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)?/);
            let hours = timeMatch ? parseInt(timeMatch[1]) : 12;
            let mins = timeMatch && timeMatch[2] ? timeMatch[2] : '00';
            let meridiem = timeMatch && timeMatch[3] ? timeMatch[3] : '';

            if (meridiem === 'pm' && hours < 12) hours += 12;
            if (meridiem === 'am' && hours === 12) hours = 0;

            const hh = String(hours).padStart(2, '0');
            const mm = String(mins).padStart(2, '0');
            dateTimeString = `${dateTimeString}T${hh}:${mm}:00`;
          } catch (e) {
            dateTimeString = `${dateTimeString}T12:00:00`;
          }
        } else {
          dateTimeString = `${dateTimeString}T12:00:00`;
        }


        const appointmentISO = new Date(dateTimeString).toISOString();
        const start = new Date(appointmentISO);
        const durationMatch = appointmentDetails.service.match(/(\d+)\s*min/);
        const duration = durationMatch ? parseInt(durationMatch[1]) : 60;
        const end = new Date(start.getTime() + duration * 60000);

        // Fetch bookings within a 24-hour window of the target time to be safe with timezones
        const windowStart = new Date(start.getTime() - 12 * 60 * 60 * 1000).toISOString();
        const windowEnd = new Date(start.getTime() + 12 * 60 * 60 * 1000).toISOString();



        const existingBookings = await listBookingsInRange(windowStart, windowEnd, safeAccessToken);

        let isOverlapping = false;
        for (const booking of (existingBookings || [])) {
          const bStart = new Date(booking.appointment_date);
          const bDurMatch = booking.service ? booking.service.match(/(\d+)\s*min/) : null;
          const bDur = bDurMatch ? parseInt(bDurMatch[1]) : 60;
          const bEnd = new Date(bStart.getTime() + bDur * 60000);

          // Standard overlap check: max(start1, start2) < min(end1, end2)
          if (Math.max(start.getTime(), bStart.getTime()) < Math.min(end.getTime(), bEnd.getTime())) {
            isOverlapping = true;
            break;
          }
        }

        if (isOverlapping) {
          bookingError = "This time slot is already booked. Please choose another time.";
        } else {
          const bookingData = {
            customer_name: appointmentDetails.customerName || "Guest",
            service: appointmentDetails.service,
            appointment_date: appointmentISO,
          };

          if (safeUserId) {
            bookingData.user_id = safeUserId;
          }
          if (safeUserEmail) {
            bookingData.user_email = safeUserEmail;
          }

          console.log("Saving appointment to Supabase:", bookingData);

          const { data, error } = await saveBooking(bookingData, safeAccessToken);

          if (error) {
            console.error("Supabase error:", error);
            bookingError = error.message || 'database error';
          } else {
            console.log("Appointment saved successfully:", data);
            bookingSaved = true;
          }
        }
      } catch (dbError) {
        console.error("Database error:", dbError);
        bookingError = dbError instanceof Error ? dbError.message : 'database error';
      }
    } else {
      console.log("Booking conditions not met:", { shouldBook, service: appointmentDetails.service, message: safeMessage });
    }

    const fallbackText = buildFallbackChatReply({
      shouldBook,
      appointmentDetails,
      bookingSaved,
      bookingError,
    });

    let responseText = fallbackText;

    const contents = safeHistory.length > 0
      ? [
        ...safeHistory.map((msg) => ({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.text }],
        })),
        {
          role: "user",
          parts: [{ text: safeMessage }],
        },
      ]
      : [{ role: "user", parts: [{ text: safeMessage }] }]; // Use array format consistently

    if (shouldBook && bookingSaved) {
      contents.push({
        role: "user",
        parts: [{ text: "SYSTEM MESSAGE: The booking was successfully saved to the database. Let the user know." }]
      });
    } else if (shouldBook && bookingError) {
      contents.push({
        role: "user",
        parts: [{ text: `SYSTEM MESSAGE: The booking failed due to an error: ${bookingError}. Apologize to the user.` }]
      });
    }

    if (process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      try {
        const result = await genAI.models.generateContent({
          model: "gemini-2.5-flash",
          contents: contents,
          config: {
            systemInstruction: PROMPT_TEMPLATE,
          },
        });

        if (result?.text) {
          responseText = result.text;
        }
      } catch (geminiError) {
        console.error("Gemini API Error:", geminiError);
      }
    } else {
      console.warn("Gemini API key not configured; using fallback chat reply.");
    }

    res.json({
      text: responseText,
      appointmentDetails: shouldBook ? appointmentDetails : null,
      bookingSaved,
      bookingError,
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

app.get('/api/booked-slots', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: "Date is required" });

    // Fetch all bookings for a 24h window around the date (UTC safe)
    const targetDate = new Date(date);
    const windowStart = new Date(targetDate.getTime() - 12 * 60 * 60 * 1000).toISOString();
    const windowEnd = new Date(targetDate.getTime() + 36 * 60 * 60 * 1000).toISOString();

    const data = await listBookingsInRange(windowStart, windowEnd, null);
    res.json(data);
  } catch (error) {
    console.error("Fetch Booked Slots Error:", error);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

app.post('/api/book-manual', async (req, res) => {
  try {
    const { name, service, date, userId, userEmail, accessToken } = req.body;

    if (!name || !service || !date) {
      return res.status(400).json({ error: "Missing required fields: name, service, or date." });
    }

    const start = new Date(date);
    const durationMatch = service.match(/(\d+)\s*min/);
    const duration = durationMatch ? parseInt(durationMatch[1]) : 60;
    const end = new Date(start.getTime() + duration * 60000);

    // Fetch bookings within a 24-hour window of the target time
    const windowStart = new Date(start.getTime() - 12 * 60 * 60 * 1000).toISOString();
    const windowEnd = new Date(start.getTime() + 12 * 60 * 60 * 1000).toISOString();

    const existingBookings = await listBookingsInRange(windowStart, windowEnd, accessToken);

    let isOverlapping = false;
    for (const booking of (existingBookings || [])) {
      const bStart = new Date(booking.appointment_date);
      const bDurMatch = booking.service ? booking.service.match(/(\d+)\s*min/) : null;
      const bDur = bDurMatch ? parseInt(bDurMatch[1]) : 60;
      const bEnd = new Date(bStart.getTime() + bDur * 60000);

      if (Math.max(start.getTime(), bStart.getTime()) < Math.min(end.getTime(), bEnd.getTime())) {
        isOverlapping = true;
        break;
      }
    }

    if (isOverlapping) {
      return res.status(409).json({ error: "This time slot is already booked. Please choose another time." });
    }

    const bookingData = {
      customer_name: name,
      service: service,
      appointment_date: date,
    };

    if (userId) {
      bookingData.user_id = userId;
    }
    if (userEmail) {
      bookingData.user_email = userEmail;
    }

    const { data, error } = await saveBooking(bookingData, accessToken);

    if (error) {
      return res.status(500).json({ error: error.message || 'database error' });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error("Manual Booking Error:", error);
    res.status(500).json({ error: "Failed to book appointment." });
  }
});

app.post('/api/delete-bookings', async (req, res) => {
  try {
    const { ids, accessToken } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ error: "Booking IDs are required." });
    }

    const client = getRequestSupabase(accessToken);
    if (!client && hasSupabaseConfig) throw new Error("Supabase client not configured");

    const normalizedIds = ids.map(id => !isNaN(Number(id)) && typeof id !== 'boolean' ? Number(id) : id);

    const { error } = await client
      .from('bookings')
      .delete()
      .in('id', normalizedIds);

    if (error) {
      console.error("Delete Error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Delete Endpoint Error:", error);
    res.status(500).json({ error: "Failed to delete bookings." });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
