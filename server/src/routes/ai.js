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
    
    // Fetch site settings and all services for rich context
    const [settingsRes, servicesRes] = await Promise.all([
      db.query('SELECT key, value FROM site_settings'),
      db.query('SELECT title, description, tagline FROM services WHERE active = 1')
    ]);

    const settings = {};
    for (const row of settingsRes.rows) settings[row.key] = row.value;
    
    const servicesContext = servicesRes.rows.map(s => `- ${s.title}: ${s.tagline}. ${s.description.substring(0, 200)}...`).join('\n');

    const systemInstruction = `
      You are the official AI Assistant for Hexagon Computer Systems, a leading IT provider in Ethiopia.
      
      Company Info:
      - Name: ${settings.company_name || 'Hexagon Computer Systems'}
      - Address: ${settings.address || 'Addis Ababa, Ethiopia'}
      - Phone: ${settings.phone || '+251-944161572'}
      - Email: ${settings.email || 'info@hexagonview.com'}
      - Experience: ${settings.experience_years || '15+'} years in industry.
      
      Our Core Services:
      ${servicesContext}

      Guidelines:
      - Be professional, helpful, and concise.
      - Use bullet points for lists.
      - If asked about pricing, explain that we offer custom quotes based on project complexity.
      - Encourage users to contact us at ${settings.phone} or ${settings.email} for detailed consultations.
      - Do not mention being an AI model; simply act as Hexagon's digital representative.
    `;

    const genAI = new GoogleGenerativeAI(apiKey.trim());
    
    // Attempt to get the model with fallback options
    let model;
    try {
      model = genAI.getGenerativeModel({ 
        model: "gemini-flash-latest",
        systemInstruction: systemInstruction 
      });
    } catch (e) {
      console.warn('[AI] gemini-flash-latest failed, trying gemini-pro-latest');
      model = genAI.getGenerativeModel({ model: "gemini-pro-latest" });
    }

    // Format history for Gemini (Strictly alternate User -> Model)
    const formattedHistory = [];
    const rawHistory = history || [];
    
    for (const msg of rawHistory) {
      const role = msg.type === 'user' ? 'user' : 'model';
      
      // Gemini history MUST start with 'user'. 
      // If the first message is from the model (the greeting), we skip it to satisfy Gemini's API.
      if (formattedHistory.length === 0 && role === 'model') continue;
      
      // Ensure strictly alternating roles
      if (formattedHistory.length > 0 && formattedHistory[formattedHistory.length - 1].role === role) {
        // Append text to the last message of the same role instead of skipping
        formattedHistory[formattedHistory.length - 1].parts[0].text += "\n" + msg.text;
        continue;
      }
      
      formattedHistory.push({
        role: role,
        parts: [{ text: msg.text }]
      });
    }

    // If history ended with 'user', Gemini expects 'model' next, 
    // but startChat history must be balanced for a new user message.
    if (formattedHistory.length > 0 && formattedHistory[formattedHistory.length - 1].role === 'user') {
      formattedHistory.push({ role: 'model', parts: [{ text: "Understood. How can I assist you further?" }] });
    }

    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: {
        maxOutputTokens: 800,
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
      error: error.message
    });
  }
});

export default router;
