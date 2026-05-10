"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./page.module.css";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentAgent, setCurrentAgent] = useState("");
  const [mode, setMode] = useState("learning");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("council_history");
    if (saved) setMessages(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("council_history", JSON.stringify(messages));
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    const userMsg = { role: "user" as const, content: query };
    setMessages(prev => [...prev, userMsg]);
    setQuery("");
    setLoading(true);

    // Simulated Progress Stepper for Agents
    const agents = ["Analyst", "Researcher", "Critic", "Optimizer", "Judge"];
    let agentIdx = 0;
    const progressInterval = setInterval(() => {
      if (agentIdx < agents.length) {
        setCurrentAgent(agents[agentIdx]);
        agentIdx++;
      }
    }, 4000);

    try {
      const res = await fetch("/api/council", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMsg.content, mode, history: messages.slice(-5) }),
      });
      
      const data = await res.json();
      clearInterval(progressInterval);
      
      if (data.answer) {
        setMessages(prev => [...prev, { role: "assistant", content: data.answer }]);
      } else {
        throw new Error(data.error || "Council unreachable");
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { role: "assistant", content: `⚠️ Error: ${err.message}` }]);
    } finally {
      setLoading(false);
      setCurrentAgent("");
    }
  };

  return (
    <main className="container animate-fade-in">
      <header style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: "800", background: "linear-gradient(45deg, #3b82f6, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Council V1
        </h1>
        <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>Karpathy-Style Multi-Agent Reasoning</p>
      </header>

      <div className={`glass-panel ${styles.chatContainer}`}>
        <div className={styles.messages}>
          {messages.length === 0 && (
            <div className={styles.emptyState}>
              <h2>Welcome to the High Council</h2>
              <p>5 expert agents are ready to deconstruct your query.</p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`${styles.message} ${m.role === "user" ? styles.user : styles.bot}`}>
              <div className={styles.bubble}>{m.content}</div>
            </div>
          ))}
          {loading && (
            <div className={styles.status}>
              <div className={styles.spinner}></div>
              <span>The <strong>{currentAgent}</strong> is deliberating...</span>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        <form onSubmit={handleSubmit} className={styles.inputArea}>
          <div className={styles.modeToggle}>
            {["learning", "coding", "research", "automation"].map(m => (
              <button 
                key={m} 
                type="button"
                className={mode === m ? styles.activeMode : ""} 
                onClick={() => setMode(m)}
              >
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>
          <div className={styles.inputWrapper}>
            <input 
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Ask the Council..."
              disabled={loading}
            />
            <button type="submit" className="btn" disabled={loading}>
              Send
            </button>
          </div>
        </form>
      </div>
      
      <button 
        className={styles.clearBtn}
        onClick={() => { setMessages([]); localStorage.removeItem("council_history"); }}
      >
        Clear Session
      </button>
    </main>
  );
}
