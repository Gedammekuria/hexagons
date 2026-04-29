import { Router } from 'express';
import { getDb } from '../db.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();

router.post('/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey || apiKey === 'paste_your_key_here') {
      return res.status(500).json({ 
        message: 'AI API Key is missing. Please add GEMINI_API_KEY to your server/.env file.' 
      });
    }

    const db = getDb();
    
    // Fetch site settings for context
    const settingsRes = await db.query('SELECT key, value FROM site_settings');
    const settings = {};
    for (const row of settingsRes.rows) settings[row.key] = row.value;

    const genAI = new GoogleGenerativeAI(apiKey);
    
    const systemInstruction = `
      You are the official AI Assistant for Hexagon Computer Systems.
      Company Info:
      - Name: ${settings.company_name || 'Hexagon Computer Systems'}
      - Address: ${settings.address || 'Addis Ababa, Ethiopia'}
      - Phone: ${settings.phone || '+251-944161572'}
      - Email: ${settings.email || 'info@hexagonview.com'}
      
      Guidelines:
      - Be professional and concise.
      - Use bullet points.
      - For prices, say we provide custom quotes.
      - If unsure, suggest calling ${settings.phone}.
    `;

    // Initialize model inside handler to ensure fresh environment
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: systemInstruction 
    });

    // Format history for Gemini (Strictly alternate User -> Model)
    const formattedHistory = [];
    const rawHistory = history || [];
    
    for (const msg of rawHistory) {
      const role = msg.type === 'user' ? 'user' : 'model';
      // Gemini cannot start with 'model' role
      if (formattedHistory.length === 0 && role === 'model') continue;
      // Gemini cannot have consecutive identical roles
      if (formattedHistory.length > 0 && formattedHistory[formattedHistory.length - 1].role === role) continue;
      
      formattedHistory.push({
        role: role,
        parts: [{ text: msg.text }]
      });
    }

    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      },
    });

    console.log('[AI] Sending request to Gemini API...');
    const result = await chat.sendMessage(message);
    const responseText = result.response.text();
    console.log('[AI] Received response successfully.');

    res.json({ text: responseText });
  } catch (error) {
    console.error('[AI Error Details]:', error);
    res.status(500).json({ 
      message: 'AI Service Error', 
      error: error.message,
      details: error.stack 
    });
  }
});

export default router;
