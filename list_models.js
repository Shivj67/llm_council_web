const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

async function list() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // There is no easy listModels in the JS SDK like in Python, but we can try different names
    const models = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-pro", "gemini-1.0-pro"];
    for (const m of models) {
        try {
            const model = genAI.getGenerativeModel({ model: m });
            await model.generateContent("test");
            console.log(`Success: ${m}`);
        } catch (e) {
            console.log(`Fail: ${m} - ${e.message}`);
        }
    }
  } catch (err) {
    console.error("List Failed:", err.message);
  }
}

list();
