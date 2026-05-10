import { GoogleGenerativeAI, DynamicRetrievalMode } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const { query, mode, history, depth } = await req.json();
    
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
    }

    // 1. Determine Agent Depth
    const allAgents = [
      { id: "analyst", name: "Analyst", role: "Deconstruct the query into logic." },
      { id: "researcher", name: "Researcher", role: "Provide facts and context using search." },
      { id: "critic", name: "Critic", role: "Identify logic flaws and hallucinations." },
      { id: "optimizer", name: "Optimizer", role: "Streamline the combined reasoning." },
      { id: "judge", name: "Judge", role: "Final answer ONLY. No logs." }
    ];

    let activeAgents = [];
    if (depth === "instant") activeAgents = [allAgents[4]];
    else if (depth === "standard") activeAgents = [allAgents[0], allAgents[1], allAgents[4]];
    else activeAgents = allAgents;

    // 2. Optimized Model Selection (V2 Flash Lite)
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-lite",
      tools: [{ googleSearchRetrieval: {} }] // Enable Google Search
    });

    let context = `HISTORY (Last 3): ${JSON.stringify(history.slice(-3))}\nMODE: ${mode}\nQUERY: ${query}\n`;

    for (const agent of activeAgents) {
      const prompt = `
        Agent: ${agent.name}
        Role: ${agent.role}
        Council Context: ${context}
        
        Action: Provide your contribution. If you are the Judge, output ONLY the final user-facing response.
      `;

      await new Promise(r => setTimeout(r, 1500)); // Minimum safety delay

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        tools: [{ googleSearchRetrieval: { dynamicRetrievalConfig: { mode: DynamicRetrievalMode.MODE_DYNAMIC, dynamicThreshold: 0.3 } } }]
      });

      const output = result.response.text();
      
      if (agent.id === "judge") {
        return NextResponse.json({ answer: output });
      } else {
        context += `\n[${agent.name}]: ${output}\n`;
      }
    }

    return NextResponse.json({ answer: "No judge output generated." });

  } catch (error: any) {
    console.error("V2 Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
