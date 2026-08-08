import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({ apiKey });
};

// Health Check API
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// 1. Fast, Low-Latency Gemini API (gemini-3.1-flash-lite)
app.post("/api/gemini/fast", async (req, res) => {
  try {
    const { prompt, context } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required." });
    }

    const ai = getGeminiClient();
    const fullPrompt = context 
      ? `Context:\n${context}\n\nTask: ${prompt}`
      : prompt;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: fullPrompt,
      config: {
        systemInstruction: "You are a ultra-fast, direct AI assistant. Provide concise, clear, and instant output.",
      },
    });

    res.json({ text: response.text || "", model: "gemini-3.1-flash-lite" });
  } catch (error: any) {
    console.error("Error in /api/gemini/fast:", error);
    res.status(500).json({ error: error.message || "Failed to process fast AI request." });
  }
});

// 2. General Assistant Gemini API (gemini-3.5-flash)
app.post("/api/gemini/general", async (req, res) => {
  try {
    const { prompt, context, taskType } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required." });
    }

    const ai = getGeminiClient();
    let systemInstruction = "You are an intelligent workspace assistant helping users analyze, summarize, write, and organize content.";
    if (taskType === "summarize") {
      systemInstruction = "Summarize the given text with structured key takeaways, bullet points, and main concepts.";
    } else if (taskType === "enhance") {
      systemInstruction = "Improve clarity, formatting, tone, and grammar of the provided text while keeping its core meaning.";
    }

    const fullPrompt = context 
      ? `Context Content:\n${context}\n\nInstruction: ${prompt}`
      : prompt;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: fullPrompt,
      config: {
        systemInstruction,
      },
    });

    res.json({ text: response.text || "", model: "gemini-3.5-flash" });
  } catch (error: any) {
    console.error("Error in /api/gemini/general:", error);
    res.status(500).json({ error: error.message || "Failed to process general AI request." });
  }
});

// 3. High Thinking Mode Gemini API (gemini-3.1-pro-preview with thinkingLevel HIGH)
app.post("/api/gemini/thinking", async (req, res) => {
  try {
    const { prompt, context } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required." });
    }

    const ai = getGeminiClient();
    const fullPrompt = context 
      ? `Document/Data Context:\n${context}\n\nComplex Query:\n${prompt}`
      : prompt;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: fullPrompt,
      config: {
        systemInstruction: "You are EduLocker AI, an expert academic document & certificate verification intelligence. Conduct deep, thorough reasoning and provide comprehensive, step-by-step solutions and insights.",
        thinkingConfig: {
          thinkingLevel: "HIGH" as any,
        },
      },
    });

    res.json({ text: response.text || "", model: "gemini-3.1-pro-preview" });
  } catch (error: any) {
    console.error("Error in /api/gemini/thinking:", error);
    res.status(500).json({ error: error.message || "Failed to process high-thinking AI request." });
  }
});

// 4. EduLocker AI Certificate Extractor API (Structured JSON output using gemini-3.5-flash)
app.post("/api/gemini/parse-certificate", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Certificate text or description is required." });
    }

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Extract academic document details from the following certificate or transcript description:\n\n${text}\n\nReturn JSON ONLY with keys:
      {
        "title": "Document or Certificate Title",
        "institution": "Issuing Institution or University or Board",
        "credentialId": "USN, Roll Number, or Credential ID if found, else N/A",
        "gradeOrMarks": "Grade, CGPA, Percentage, or Distinction if found, else N/A",
        "category": "One of: 'Degree & Diploma', 'Marksheets & Transcripts', 'Certifications', 'Identity & Student Cards', 'Recommendations & Conduct', 'Projects & Research'",
        "issueDate": "YYYY-MM-DD or Month Year if found",
        "summary": "2-sentence executive summary of the credential"
      }`,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "You are EduLocker AI Extractor. Extract structured academic credential metadata accurately in valid JSON.",
      },
    });

    const parsedJson = JSON.parse(response.text || "{}");
    res.json({ extracted: parsedJson, rawText: response.text, model: "gemini-3.5-flash" });
  } catch (error: any) {
    console.error("Error in /api/gemini/parse-certificate:", error);
    res.status(500).json({ error: error.message || "Failed to extract certificate details." });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
