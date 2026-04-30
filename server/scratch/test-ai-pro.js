import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

async function test() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('Using Key:', apiKey.trim().substring(0, 5) + '...');
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey.trim());
    // Try gemini-pro directly as it is the most compatible
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent("Hello!");
    console.log('Response (gemini-pro):', result.response.text());
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();
