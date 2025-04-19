const express = require("express");
const cors = require("cors");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
require("dotenv").config();


const app = express();
const PORT = 5007;

const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.json());

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Health check
app.get("/", (req, res) => {
  res.send("✅ Simple server is working!");
});

// ElevenLabs narration
app.post("/api/narrate", async (req, res) => {
  const { text } = req.body;
  const apiKey = "sk_3567f718ee737a3c05c1a5545109cbc17557135b8b88835a";

  try {
    const response = await axios.post(
      "https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL",
      {
        text,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      },
      {
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        responseType: "arraybuffer",
      }
    );

    res.setHeader("Content-Type", "audio/mpeg");
    res.send(response.data);
  } catch (err) {
    console.error("🛑 ElevenLabs API error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch audio" });
  }
});

// Upload + extract content
app.post("/api/upload", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const filePath = path.join(__dirname, "uploads", req.file.filename);
  const originalName = req.file.originalname.toLowerCase();

  try {
    let text = "";

    if (originalName.endsWith(".pdf")) {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      text = pdfData.text;
    } else if (originalName.endsWith(".docx")) {
      const result = await mammoth.extractRawText({ path: filePath });
      text = result.value;
    } else if (originalName.endsWith(".txt")) {
      text = fs.readFileSync(filePath, "utf-8");
    } else {
      return res.status(400).json({ error: "Unsupported file type" });
    }

    console.log("✅ Extracted text length:", text.length);
    res.json({ text });
  } catch (err) {
    console.error("❌ File parsing error:", err.message);
    res.status(500).json({ error: "Failed to extract text" });
  }
});

// Helper: build prompt based on grade
const getPrompt = (text, grade, isSubject = false) => {
    const normalized = grade?.toLowerCase() || "middle";
    let audienceNote = "";
  
    switch (normalized) {
      case 'elementary':
        audienceNote = `
  📘 Audience: Elementary School Students (Grades 3–5)
  
  Your job is to create a playful, fun, and educational slide deck like a cheerful teacher or children's storyteller.
  
  🎯 Instructions — STRICTLY FOLLOW:
  - Output **exactly 6 slides**
  - Each slide must include:
     • A short **Title**
     • **Exactly 1 paragraph**
     • Paragraph = **4–6 short, fun sentences**
     • Use simple, kid-friendly words and examples (e.g., pizza, pets, cartoons)
     • Include fun emojis when helpful 🎨🧠🦄🍕🚀
     • Be warm and enthusiastic — make it exciting and easy to understand
     • DO NOT use bullet points or explain anything outside JSON
     • Output ONLY valid JSON in this exact format:
  
  [
   {
     "title": "Slide Title",
     "content": "One playful paragraph with emojis and simple words"
   },
   ...
  ]
  
  ❗NO extra text. Just output valid JSON. Do not write anything before or after the array.
        `;
        break;
  
      case 'middle':
        audienceNote = `
  📘 Audience: Middle School Students (Grades 6–8)
  
  Your job is to create a fun, clear, and informative slide deck suitable for classroom presentation.
  
  🎯 Instructions — STRICTLY FOLLOW:
  - Output **exactly 8 slides**
  - Each slide must include:
     • A short **Title**
     • **Exactly 2 paragraphs**
     • Each paragraph = **4–6 sentences**
     • Use bullet points ONLY if it improves clarity
     • Use a friendly tone but maintain educational value
     • Use examples and analogies middle schoolers understand
     • Output ONLY in this format:
  
  [
   {
     "title": "Slide Title",
     "content": "Paragraph 1\\n\\nParagraph 2"
   },
   ...
  ]
  
  ❗Do NOT summarize too much or reduce number of slides or paragraphs.
        `;
        break;
  
      case 'high':
        audienceNote = `
  📘 Audience: High School Students (Grades 9–12)
  
  Your job is to create a structured, academic slide deck.
  
  🎯 Instructions — STRICTLY FOLLOW:
  - Output **exactly 10 slides**
  - Each slide must include:
     • A short **Title**
     • **Exactly 3 paragraphs**
     • Each paragraph = **5–7 full sentences**
     • No bullet points
     • No summarization — **go deep**
     • Use a serious academic tone (no emojis, jokes, or casual phrases)
     • Output only in this format:
  
  [
   {
     "title": "Slide Title",
     "content": "Paragraph 1\\n\\nParagraph 2\\n\\nParagraph 3"
   },
   ...
  ]
  
  ❗DO NOT skip slides, shorten paragraphs, or change the format.
        `;
        break;
  
      default:
        audienceNote = `Use clear, student-friendly language appropriate for a general audience.`;
    }
  
    return `${audienceNote}
  
  Now rewrite the topic below into a slide-based lesson presentation formatted strictly as JSON.
  
  ⚠️ Only output JSON — do NOT explain, do NOT write "Slide 1", and do NOT include anything except the JSON array.
  
  --- START OF ${isSubject ? "TOPIC" : "TEXT"} ---
  ${text}
  --- END ---
  `;
  };
  
  app.post("/api/summarize", async (req, res) => {
    const { text, grade } = req.body;
    console.log("🟡 Incoming text:", text?.slice(0, 100));
    console.log("🎓 Grade:", grade);
  
    const prompt = getPrompt(text, grade);
    console.log("📝 Prompt built:", prompt?.slice(0, 300));
  
    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      const raw = response.data.choices[0].message.content.trim();
      const fixed = raw.replace(/“|”/g, '"').replace(/‘|’/g, "'").replace(/\r/g, "");
  
      try {
        const parsed = JSON.parse(fixed);
        res.json({ summary: parsed });
      } catch {
        console.error("❌ JSON parsing failed:", fixed);
        res.status(400).json({ error: "Invalid JSON", raw: fixed });
      }
    } catch (err) {
      console.error("❌ OpenAI API error:", err.response?.data || err.message);
      res.status(500).json({ error: "OpenAI request failed" });
    }
  });
  

// /api/subject
app.post('/api/subject', async (req, res) => {
    const { subject, grade } = req.body;
    const normalizedGrade = (grade || '').toLowerCase();
    console.log("🧪 Incoming subject:", subject);
    console.log("🧪 Grade:", normalizedGrade);
  
    let audienceNote = '';
  
    switch (normalizedGrade) {
      case 'elementary':
        audienceNote = `
  📘 Audience: Elementary School Students (Grades 3–5)
  
  You are creating a fun, playful, and easy-to-understand slide deck for young students.
  
  🎯 Rules:
  - Exactly 6 slides
  - Each slide includes:
    - A fun title
    - 1 short paragraph (4–6 simple sentences)
    - Use easy vocabulary (e.g., pizza, cartoons)
    - Add fun emojis 🎨🧠🦄🍕🚀
  - Format as strict JSON like:
  [
    {
      "title": "Slide Title",
      "content": "Fun paragraph with emojis"
    },
    ...
  ]
  NO explanations or text before/after JSON.
        `;
        break;
  
      case 'middle':
        audienceNote = `
  📘 Audience: Middle School Students (Grades 6–8)
  
  You are writing a clear, fun, and smart slide deck for classroom use.
  
  🎯 Rules:
  - Exactly 8 slides
  - Each slide:
    - Title + 2 paragraphs
    - Each paragraph: 4–6 informative sentences
    - Use analogies, examples, and bullet points (if helpful)
    - Format like:
  [
    {
      "title": "Slide Title",
      "content": "Paragraph 1\\n\\nParagraph 2"
    },
    ...
  ]
  NO text outside JSON array.
        `;
        break;
  
      case 'high':
        audienceNote = `
  📘 Audience: High School Students (Grades 9–12)
  
  Write an academic, deep slide deck.
  
  🎯 Rules:
  - Exactly 10 slides
  - Each slide:
    - Title + 3 deep paragraphs
    - Each paragraph: 5–7 full sentences
    - No emojis, no bullets
    - Use formal tone
    - Format like:
  [
    {
      "title": "Slide Title",
      "content": "Paragraph 1\\n\\nParagraph 2\\n\\nParagraph 3"
    },
    ...
  ]
  NO text before or after JSON.
        `;
        break;
  
      default:
        audienceNote = `Use clear language and format as a JSON array.`;
    }
  
    const prompt = `
  ${audienceNote}
  
  Now generate a slide-based presentation for the topic below:
  
  --- START OF TOPIC ---
  ${subject}
  --- END ---
  `;
  
    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      const raw = response.data.choices[0].message.content.trim();
      console.log("📦 RAW from OpenAI:\n", raw);
  
      const fixed = raw
        .replace(/“|”/g, '"')
        .replace(/‘|’/g, "'")
        .replace(/\r/g, '')
        .replace(/\nSlide \d+:/g, '') // remove "Slide 1:" if present
        .trim();
  
      try {
        const parsed = JSON.parse(fixed);
        console.log("✅ JSON parsed successfully");
        res.json({ summary: parsed });
      } catch (err) {
        console.warn("❌ Failed to parse JSON:\n", fixed);
        res.status(400).json({ error: "Invalid JSON from OpenAI", raw: fixed });
      }
    } catch (err) {
      console.error("❌ OpenAI error:", err.response?.data || err.message);
      res.status(500).json({ error: "OpenAI request failed" });
    }
  });
  

  app.post('/api/ask', async (req, res) => {
    const { question, context } = req.body;
  
    const prompt = `
  You are an educational assistant helping a student with a slide-based lesson.
  
  📘 Slide Content:
  ---
  ${context}
  ---
  
  ✍️ The student has a question:
  "${question}"
  
  🎯 Please provide a clear, relevant answer based on the slide or logical background knowledge.
  Avoid saying "this is not in the slide" — answer like a kind teacher in class.
  `;
  
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      const reply = response.data.choices[0].message.content.trim();
      res.json({ answer: reply });
    } catch (err) {
      console.error('❌ Q&A API failed:', err.response?.data || err.message);
      res.status(500).json({ error: 'Failed to answer question' });
    }
  });
  
  
// Launch server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://127.0.0.1:${PORT}`);
});
