import { sendWhatsAppMessage } from "@/lib/whatsapp";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { to, message } = req.body;

  if (!to || !message) {
    return res.status(400).json({ error: "Missing 'to' or 'message'" });
  }

  try {
    const result = await sendWhatsAppMessage(to, message);
    return res.status(200).json({ success: true, result });
  } catch (err) {
    console.error("send-message failed:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
