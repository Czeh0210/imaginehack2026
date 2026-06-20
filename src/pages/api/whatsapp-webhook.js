import { GoogleGenAI } from "@google/genai";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `You are a personal assistant for a financial advisor.
Your job is to help them manage their day: answer questions, draft responses, summarise tasks, and give reminders.
Be concise, professional, and friendly. Respond in the same language the user writes in.`;

async function getAIReply(userMessage) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-lite",
    contents: userMessage,
    config: { systemInstruction: SYSTEM_PROMPT },
  });
  return response.text;
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("WhatsApp webhook verified");
      return res.status(200).send(challenge);
    }
    return res.status(403).send("Verification failed");
  }

  if (req.method === "POST") {
    const body = req.body;
    console.log("WhatsApp webhook received:", JSON.stringify(body, null, 2));

    for (const entry of body.entry ?? []) {
      const value = entry.changes?.[0]?.value;

      // Incoming messages — reply with AI
      for (const message of value?.messages ?? []) {
        const from = message.from;
        const text =
          message.type === "text" ? message.text?.body : `[${message.type}]`;

        console.log("Incoming message:", { from, type: message.type, text });

        try {
          const reply = await getAIReply(text);
          await sendWhatsAppMessage(from, reply);
          console.log("AI reply sent to", from);
        } catch (err) {
          console.error("Failed to send AI reply:", err.message);
        }
      }

      // Outgoing message status updates
      for (const status of value?.statuses ?? []) {
        console.log("Message status update:", {
          recipient: status.recipient_id,
          status: status.status,
          timestamp: status.timestamp,
        });
      }
    }

    return res.status(200).send("EVENT_RECEIVED");
  }

  return res.status(405).send("Method not allowed");
}
