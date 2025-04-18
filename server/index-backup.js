const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5008;
const corsOptions = {
    origin: "http://localhost:3003", // Frontend's URL (port 3003 by default)
  };
  
  app.use(cors(corsOptions));
  
app.use(express.json());

app.get('/', (req, res) => {
  res.send('👋 Hello from the backend!');
});

const multer = require('multer');
const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');
const upload = multer({ dest: 'uploads/' });

const axios = require('axios');
const OPENAI_API_KEY = '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'; 

app.post('/api/summarize', async (req, res) => {
  const { text } = req.body;
  console.log('📥 Received text for summarization:', text?.slice(0, 200));

  if (!text) {
    return res.status(400).json({ summary: '', error: 'No text provided' });
  }

  try {
    const prompt = `
You are an expert lesson designer for educators creating engaging, visual video content.

Analyze the following lesson and generate a high-impact, bullet-point slide outline.

Each bullet point should:
- Be phrased in a clear, engaging, conversational tone
- Include real-life examples or analogies if helpful
- Suggest visuals (e.g., "[show animation of solar system]")
- Avoid dry repetition — make it interesting and rich
- Focus on what the student should *feel* and *understand*

Make the content exciting and powerful — the kind you'd hear narrated in a top-tier educational video.

Lesson Text:
${text}
`;


    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const summary = response.data.choices[0].message.content;
    res.json({ summary });
  } catch (err) {
    console.error('❌ Summarization error:', err.response?.data || err.message);
    res.status(500).json({ summary: '', error: 'Failed to summarize text' });
  }
});

app.post("/api/narrate", async (req, res) => {
    const { text } = req.body;
    const apiKey = "sk_3567f718ee737a3c05c1a5545109cbc17557135b8b88835a"; // Replace later with env
    
    try {
      const response = await axios.post(
        "https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL", // Replace with your voice ID
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
            "Accept": "audio/mpeg",
          },
          responseType: "arraybuffer",
        }
      );
    
      res.setHeader("Content-Type", "audio/mpeg");
      res.send(response.data);
    } catch (error) {
      console.error("🛑 ElevenLabs API error:", error.response?.data || error.message);
      res.status(500).json({ error: "Failed to fetch audio" });
    }
  });


  app.listen(5007, '127.0.0.1', () => {
    console.log('🚀 Server running at http://127.0.0.1:5007');
  });
  
  
  
  
  
