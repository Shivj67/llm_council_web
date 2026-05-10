import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const { query, mode, history } = await req.json();
    
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });

    // Council Personas
    const agents = [
      { name: "Analyst", role: "Deconstruct the query into logical requirements." },
      { name: "Researcher", role: "Provide facts, context, and structural knowledge." },
      { name: "Critic", role: "Identify logic flaws, biases, and hallucinations." },
      { name: "Optimizer", role: "Refine and condense the combined reasoning." },
      { name: "Judge", role: "Synthesize the final, high-quality response. Output ONLY the final response text. Do NOT include internal logs, evaluation notes, or 'Final Response' labels. Your output goes directly to the user." }
    ];

    let currentHistory = `HISTORY: ${JSON.stringify(history)}\nQUERY: ${query}\nMODE: ${mode}\n`;
    let finalAnswer = "";

    // Sequential Baton Passing
    for (const agent of agents) {
      const prompt = `
        You are the ${agent.name} Agent in a Council of Experts.
        Your task: ${agent.role}
        
        Current Context:
        ${currentHistory}
        
        Action: Provide your specialized contribution. Keep it internal and logical.
      `;

      // Free tier rate limit delay (brief)
      await new Promise(r => setTimeout(r, 2000));

      const result = await model.generateContent(prompt);
      const output = result.response.text();
      
      if (agent.name === "Judge") {
        finalAnswer = output;
      } else {
        currentHistory += `\n[${agent.name} Output]: ${output}\n`;
      }
    }

    return NextResponse.json({ answer: finalAnswer });
    
  } catch (error: any) {
    console.error("Council Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
