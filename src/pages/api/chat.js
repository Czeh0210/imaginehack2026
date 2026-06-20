import { GoogleGenerativeAI } from "@google/generative-ai";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Cached list of working models (refreshed per server restart)
let cachedModels = null;

// Preferred model order — sorted by speed & availability (fastest first)
// These are the actual models available on this API key (discovered via ListModels)
const PREFERRED_ORDER = [
  "gemini-2.5-flash",          // best balance of speed + quality ✓
  "gemini-2.0-flash",          // fast, reliable ✓
  "gemini-2.0-flash-lite",     // lightest ✓
  "gemini-flash-latest",       // alias → latest flash ✓
  "gemini-flash-lite-latest",  // alias → latest flash-lite ✓
  "gemini-2.0-flash-001",      // pinned version ✓
  "gemini-2.0-flash-lite-001", // pinned version ✓
  "gemini-2.5-flash-lite",     // 2.5 lite ✓
  "gemini-pro-latest",         // alias → latest pro ✓
  "gemini-2.5-pro",            // most capable (slower) ✓
];

/**
 * Dynamically discover which models are available for this API key
 * by calling the ListModels endpoint. Results are cached in memory.
 */
async function getAvailableModels() {
  if (cachedModels) return cachedModels;

  try {
    console.log("Discovering available Gemini models...");
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
    );
    const data = await response.json();

    if (!response.ok) {
      console.error("ListModels failed:", data);
      return PREFERRED_ORDER; // fallback to static list
    }

    const available = (data.models || [])
      .filter(
        (m) =>
          m.supportedGenerationMethods?.includes("generateContent") &&
          !m.name.includes("embedding") &&
          !m.name.includes("aqa")
      )
      .map((m) => m.name.replace("models/", ""));

    console.log("Available models:", available);

    // Sort by preference — preferred models first, then alphabetically
    const sorted = available.sort((a, b) => {
      const ai = PREFERRED_ORDER.indexOf(a);
      const bi = PREFERRED_ORDER.indexOf(b);
      if (ai === -1 && bi === -1) return a.localeCompare(b);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });

    cachedModels = sorted.length > 0 ? sorted : PREFERRED_ORDER;
    return cachedModels;
  } catch (err) {
    console.error("Failed to discover models:", err.message);
    return PREFERRED_ORDER;
  }
}

async function tryModelWithFallback(modelList, buildChat, userParts) {
  let lastError = null;

  for (const modelName of modelList) {
    try {
      console.log(`Trying model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const chat = buildChat(model);
      const result = await chat.sendMessage(userParts);
      const response = await result.response;
      console.log(`✓ Success with model: ${modelName}`);
      return { text: response.text(), model: modelName };
    } catch (err) {
      const is429 = err?.message?.includes("429") || err?.status === 429;
      const is404 = err?.message?.includes("404") || err?.status === 404;
      const is503 = err?.message?.includes("503") || err?.status === 503;

      console.warn(
        `✗ Model ${modelName} failed (${err?.status ?? "?"}):`,
        err?.message?.slice(0, 100)
      );

      if (is429 || is404 || is503) {
        // Invalidate cache if we got unexpected 404s (models may have changed)
        if (is404) cachedModels = null;
        lastError = err;
        continue;
      }

      // Auth / bad request errors — stop immediately
      throw err;
    }
  }

  throw lastError;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, history, fileData } = req.body;

    if (!message && !fileData) {
      return res.status(400).json({ error: "Message or file is required" });
    }

    // Discover which models are actually available for this key
    const availableModels = await getAvailableModels();
    console.log(`Will try ${availableModels.length} models:`, availableModels.slice(0, 4));

    // Build conversation history
    const chatHistory = (history || []).map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    const isFileAnalysis = !!fileData;

    const CHAT_SYSTEM = `You are a helpful, knowledgeable AI assistant. You provide clear, accurate, and thoughtful responses.
Format your responses with markdown when helpful (bold, italic, bullet points, numbered lists, code blocks, etc.).
Be concise but thorough.`;

    const ANALYSIS_SYSTEM = `You are an expert document analyst. When given a document to analyze, you MUST respond ONLY with a valid JSON object inside a markdown code block.

The JSON must follow this exact structure:
\`\`\`json
{
  "type": "analysis",
  "summary": "2-3 sentence overview of the document",
  "improvements": [
    {
      "highlight": "exact quote or short phrase from the document that needs improvement",
      "issue": "concise explanation of what is wrong or weak",
      "suggestion": "specific, actionable improvement advice",
      "resources": [
        { "title": "Resource Name", "url": "https://real-url.com" },
        { "title": "Another Resource", "url": "https://real-url.com" }
      ]
    }
  ]
}
\`\`\`

Rules:
- Provide 3 to 7 improvements.
- Each "highlight" must be a short, exact quote (max 20 words) taken directly from the document.
- Resources must be REAL, working URLs from authoritative sources: MDN, official documentation, academic papers (PubMed, arXiv), government sites (.gov), or well-known reputable guides (Nielsen Norman Group, WCAG, ISO standards, etc.).
- Do NOT include any text outside the JSON code block.
- Do NOT make up URLs — only use sources you are confident exist.`;

    const buildChat = (model) =>
      model.startChat({
        history: chatHistory,
        generationConfig: {
          maxOutputTokens: 8192,
          temperature: isFileAnalysis ? 0.3 : 0.7,
        },
        systemInstruction: {
          parts: [{ text: isFileAnalysis ? ANALYSIS_SYSTEM : CHAT_SYSTEM }],
        },
      });

    // Build user message parts
    const userParts = [];

    if (fileData) {
      userParts.push({
        inlineData: {
          mimeType: fileData.mimeType,
          data: fileData.base64,
        },
      });
    }

    if (message) {
      userParts.push({ text: message });
    } else {
      userParts.push({
        text: "Analyze this document. Identify all areas that need improvement and return the structured JSON analysis as instructed.",
      });
    }

    const { text, model: usedModel } = await tryModelWithFallback(
      availableModels,
      buildChat,
      userParts
    );

    return res.status(200).json({ reply: text, model: usedModel, isAnalysis: isFileAnalysis });
  } catch (error) {
    console.error("Chat API final error:", error?.message);

    if (
      error?.message?.includes("API_KEY") ||
      error?.message?.includes("API key") ||
      error?.status === 401
    ) {
      return res.status(401).json({
        error: "Invalid API key. Please check GEMINI_API_KEY in .env.local",
      });
    }

    if (error?.message?.includes("429") || error?.status === 429) {
      return res.status(429).json({
        error:
          "All available models are rate-limited. Please wait a minute and try again.",
      });
    }

    if (error?.message?.includes("404") || error?.status === 404) {
      return res.status(404).json({
        error:
          "No working Gemini models found for your API key. Please ensure your key is from https://aistudio.google.com/apikey",
      });
    }

    return res.status(500).json({
      error:
        error?.message || "An error occurred while processing your request.",
    });
  }
}
