import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

async function test() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('Using Key:', apiKey.substring(0, 5) + '...');
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Try without the models/ prefix if the library adds it
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hello!");
    console.log('Response:', result.response.text());
  } catch (err) {
    console.error('Error:', err.message);
    if (err.message.includes('404')) {
        console.log('Trying alternative model name...');
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const result = await model.generateContent("Hello!");
            console.log('Response (gemini-pro):', result.response.text());
        } catch (err2) {
            console.error('Second Error:', err2.message);
        }
    }
  }
}

test();
