import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const models = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
];

for (const model of models) {
  process.stdout.write(`Testing ${model}... `);
  try {
    const res = await ai.models.generateContent({
      model,
      contents: "Say hi",
    });
    console.log(`✓ works — "${res.text.trim().slice(0, 40)}"`);
  } catch (err) {
    const msg = JSON.parse(err.message)?.error?.message ?? err.message;
    console.log(`✗ ${msg.split("\n")[0]}`);
  }
}
