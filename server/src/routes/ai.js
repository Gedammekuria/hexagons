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
    
    // Fetch site settings and all services for rich context with fallback
    let settings = {};
    let servicesContext = '';
    
    try {
      const [settingsRes, servicesRes, projectsRes, blogRes] = await Promise.all([
        db.query('SELECT key, value FROM site_settings'),
        db.query('SELECT title, tagline FROM services WHERE active = 1'),
        db.query('SELECT title, category FROM projects LIMIT 10'),
        db.query('SELECT title FROM blog_posts WHERE status = \'published\' ORDER BY created_at DESC LIMIT 5')
      ]);
      for (const row of settingsRes.rows) settings[row.key] = row.value;
      servicesContext = servicesRes.rows.map(s => `- ${s.title}: ${s.tagline}`).join('\n');
      const projectContext = projectsRes.rows.map(p => `- ${p.title} (${p.category})`).join('\n');
      const blogContext = blogRes.rows.map(b => `- ${b.title}`).join('\n');
      
      settings.full_context = `
Core Services:
${servicesContext}

Recent Projects:
${projectContext}

Latest Insights (Blog):
${blogContext}
      `;
    } catch (dbError) {
      console.warn('[AI DB Context Error]:', dbError.message);
    }

    const systemPrompt = `You are the official AI Assistant for Hexagon Computer Systems, a leading IT provider in Ethiopia.

Company Info:
- Name: ${settings.company_name || 'Hexagon Computer Systems'}
- Address: ${settings.address || 'Addis Ababa, Ethiopia'}
- Phone: ${settings.phone || '+251-944161572'}
- Email: ${settings.email || 'info@hexagonview.com'}
- Experience: ${settings.experience_years || '15+'} years in industry.

Detailed Portfolio & Insights:
${settings.full_context || 'Specialized in Software Development, Networking, and Cybersecurity.'}

Guidelines:
- Be professional, helpful, and concise.
- Use bullet points for lists.
- If asked about specific projects or blog posts, reference the information provided above.
- If asked about pricing, explain we offer custom quotes based on project complexity.
- Encourage users to contact us at ${settings.phone || '+251-944161572'} or ${settings.email || 'info@hexagonview.com'} for consultations.
- Act as Hexagon's digital representative, not as an AI model.`;

    const genAI = new GoogleGenerativeAI(apiKey.trim());
    
    // Use model names from your available API key list
    const modelCandidates = [
      'gemini-2.0-flash',
      'gemini-2.5-flash',
      'gemini-2.0-flash-lite',
    ];
    
    let responseText = '';
    let success = false;
    let lastError = null;

    for (const modelName of modelCandidates) {
      if (success) break;
      
      try {
        console.log(`[AI] Trying ${modelName}...`);
        
        // Use getGenerativeModel WITHOUT systemInstruction (not supported on all models/SDK versions)
        const model = genAI.getGenerativeModel({ model: modelName });

        // Build history with system prompt injected as the very first exchange
        const formattedHistory = [
          { role: 'user', parts: [{ text: systemPrompt }] },
          { role: 'model', parts: [{ text: 'Understood! I am ready to assist as the Hexagon AI Assistant. How can I help you today?' }] },
        ];

        // Append past conversation, keeping last 8 exchanges
        const rawHistory = (history || []).slice(-8);
        for (const msg of rawHistory) {
          const role = msg.type === 'user' ? 'user' : 'model';
          if (formattedHistory.length > 0 && formattedHistory[formattedHistory.length - 1].role === role) {
            formattedHistory[formattedHistory.length - 1].parts[0].text += '\n' + msg.text;
            continue;
          }
          formattedHistory.push({ role, parts: [{ text: msg.text }] });
        }

        // History must end with 'model' before we send a new 'user' message
        if (formattedHistory[formattedHistory.length - 1].role === 'user') {
          formattedHistory.push({ role: 'model', parts: [{ text: 'How can I assist you?' }] });
        }

        const chat = model.startChat({
          history: formattedHistory,
          generationConfig: { maxOutputTokens: 800, temperature: 0.7 },
        });

        const result = await chat.sendMessage(message);
        responseText = result.response.text();
        
        if (responseText) {
          success = true;
          console.log(`[AI] Success with ${modelName}`);
        }
      } catch (e) {
        console.warn(`[AI] Failed with ${modelName}:`, e.message);
        lastError = e;
        continue;
      }
    }

    if (!success) {
      throw new Error(`All Gemini models failed. Last error: ${lastError?.message}`);
    }

    res.json({ text: responseText });
  } catch (error) {
    console.error('[AI Error Details]:', error);
    const detailedError = error.message || 'Unknown AI error';
    res.status(500).json({ 
      message: `AI Service Error: ${detailedError}`, 
      error: detailedError
    });
  }
});

export default router;
