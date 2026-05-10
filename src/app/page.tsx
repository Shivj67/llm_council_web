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
  const [depth, setDepth] = useState("standard");
  const [mode, setMode] = useState("learning");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("council_history_v2");
    if (saved) setMessages(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("council_history_v2", JSON.stringify(messages));
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    const userMsg = { role: "user" as const, content: query };
    setMessages(prev => [...prev, userMsg]);
    setQuery("");
    setLoading(true);

    try {
      const res = await fetch("/api/council", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMsg.content, mode, history: messages.slice(-3), depth }),
      });
      
      const data = await res.json();
      if (data.answer) {
        setMessages(prev => [...prev, { role: "assistant", content: data.answer }]);
      } else {
        throw new Error(data.error || "Council unreachable");
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { role: "assistant", content: `⚠️ Error: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = (text: string) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const exportChat = () => {
    const text = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n");
    const blob = new Blob([text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `council_chat_${Date.now()}.md`;
    a.click();
  };

  return (
    <main className="container animate-fade-in">
      <header className={styles.header}>
        <h1 className={styles.title}>Council V2 Elite</h1>
        <div className={styles.badge}>Powered by Gemini 2.0 Flash Lite</div>
      </header>

      <div className={`glass-panel ${styles.chatContainer}`}>
        {/* Sidebar for Settings */}
        <div className={styles.sidebar}>
          <div className={styles.section}>
            <label>Reasoning Depth</label>
            <div className={styles.toggleGroup}>
              {["instant", "standard", "deep"].map(d => (
                <button key={d} className={depth === d ? styles.active : ""} onClick={() => setDepth(d)}>{d}</button>
              ))}
            </div>
          </div>
          <div className={styles.section}>
            <label>Intelligence Panel</label>
            <select value={mode} onChange={e => setMode(e.target.value)} className={styles.select}>
              <option value="learning">Learning Panel</option>
              <option value="coding">Coding Panel</option>
              <option value="research">Research Panel (Web Search)</option>
              <option value="automation">Automation Panel</option>
            </select>
          </div>
          <button className={styles.actionBtn} onClick={exportChat}>Export Chat (.md)</button>
          <button className={styles.actionBtn} onClick={() => { setMessages([]); localStorage.removeItem("council_history_v2"); }}>Clear History</button>
        </div>

        {/* Main Chat Area */}
        <div className={styles.chatBody}>
          <div className={styles.messages}>
            {messages.map((m, i) => (
              <div key={i} className={`${styles.message} ${m.role === "user" ? styles.user : styles.bot}`}>
                <div className={styles.bubble}>
                  {m.content}
                  {m.role === "assistant" && (
                    <button onClick={() => handleSpeak(m.content)} className={styles.voiceBtn}>
                      {isSpeaking ? "🔇 Stop" : "🔊 Listen"}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className={styles.loading}>
                <div className={styles.dotPulse}></div>
                <span>Council Deliberating...</span>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          <form onSubmit={handleSubmit} className={styles.inputArea}>
            <input 
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Enter your inquiry..."
              disabled={loading}
            />
            <button type="submit" className="btn" disabled={loading}>Analyze</button>
          </form>
        </div>
      </div>
    </main>
  );
}
