import { sendWhatsAppMessage } from "@/lib/whatsapp";

// Comma-separated list of advisor phone numbers to notify, e.g. "601112345678,601198765432"
const ADVISOR_PHONES = (process.env.ADVISOR_PHONE_NUMBERS ?? "").split(",").filter(Boolean);


export default async function handler(req, res) {
  // Protect the endpoint with a shared secret so only your cron can call it
  const secret = req.headers["x-cron-secret"] ?? req.query.secret;
  if (secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method !== "POST" && req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (ADVISOR_PHONES.length === 0) {
    return res.status(500).json({ error: "ADVISOR_PHONE_NUMBERS not configured" });
  }

  const today = new Date().toLocaleDateString("en-MY", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Kuala_Lumpur",
  });

  const plan = `📅 Today's Plan\n\n1. Follow up with client +601136228183 about the estate situation\n2. Meeting at 10am at Subang Jaya`;

  const results = await Promise.allSettled(
    ADVISOR_PHONES.map((phone) => sendWhatsAppMessage(phone.trim(), plan))
  );

  const summary = results.map((r, i) => ({
    phone: ADVISOR_PHONES[i],
    status: r.status,
    ...(r.reason ? { error: r.reason.message } : {}),
  }));

  console.log("Daily reminder sent:", summary);
  return res.status(200).json({ date: today, summary });
}
