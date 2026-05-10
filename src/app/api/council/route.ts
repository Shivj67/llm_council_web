import { GoogleGenerativeAI, DynamicRetrievalMode } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

// Multi-Key Management
const keys = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_2
].filter(Boolean);

export async function POST(req: NextRequest) {
  try {
    const { query, mode, history, depth } = await req.json();
    
    if (keys.length === 0) {
      return NextResponse.json({ error: "No API Keys Configured" }, { status: 500 });
    }

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

    // Fallback Models List
    const modelNames = ["gemini-2.0-flash-lite", "gemini-1.5-flash", "gemini-pro"];

    let context = `HISTORY: ${JSON.stringify(history.slice(-3))}\nMODE: ${mode}\nQUERY: ${query}\n`;

    for (const agent of activeAgents) {
      const prompt = `Agent: ${agent.name}\nRole: ${agent.role}\nContext: ${context}\nAction: Provide contribution.`;

      await new Promise(r => setTimeout(r, 1500));

      let output = "";
      let success = false;
      
      // Multi-Key + Multi-Model Rotation
      for (const key of keys) {
        if (success) break;
        const genAI = new GoogleGenerativeAI(key!);

        for (const modelName of modelNames) {
          try {
            const model = genAI.getGenerativeModel({ 
              model: modelName,
              tools: [{ googleSearchRetrieval: {} }]
            });
            
            const result = await model.generateContent({
              contents: [{ role: "user", parts: [{ text: prompt }] }],
              tools: [{ googleSearchRetrieval: { dynamicRetrievalConfig: { mode: DynamicRetrievalMode.MODE_DYNAMIC, dynamicThreshold: 0.3 } } }]
            });
            
            output = result.response.text();
            success = true;
            break; 
          } catch (e: any) {
            console.warn(`Key/Model combo failed: ${modelName}. Trying next...`);
            continue;
          }
        }
      }

      if (!success) throw new Error("All API keys and models are currently exhausted. Please wait 10 minutes.");
      
      if (agent.id === "judge") return NextResponse.json({ answer: output });
      context += `\n[${agent.name}]: ${output}\n`;
    }

    return NextResponse.json({ answer: "Process complete." });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
