"use client";

import { useState, useRef, useEffect } from "react";
import KoinChan from "./KoinChan";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const STARTERS = [
  "💸 Gimana cara mulai nabung kalau gaji pas-pasan?",
  "📈 Apa itu reksa dana dan cocok buat pemula?",
  "📊 Bikin budget bulanan untuk gaji Rp 5 juta",
  "💳 Cara keluar dari jerat utang kartu kredit?",
];

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Haii~! Aku Koin-chan, asisten keuangan AI-mu! ✨\n\nAra ara~ ada yang bisa aku bantu soal keuangan hari ini? Mau tanya soal budgeting, investasi, nabung, atau apapun — yosh, aku siap membantu! 💰",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mood, setMood] = useState<"happy" | "thinking" | "excited" | "neutral">("happy");
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput("");
    setMood("thinking");

    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const next: Message[] = [...messages, { role: "user", content: msg }];
    setMessages(next);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMessages([...next, { role: "assistant", content: String(data.message ?? "") }]);
      setMood("excited");
      setTimeout(() => setMood("happy"), 2000);
    } catch (err) {
      console.error(err);
      setMessages([...next, { role: "assistant", content: "Gomen ne~ ada error nih! Coba lagi ya~ 🙏" }]);
      setMood("neutral");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
  };

  return (
    <div className="chat-wrapper">
      {/* Avatar header */}
      <div className="chat-header">
        <div className="koin-float">
          <KoinChan mood={mood} size={64} />
        </div>
        <div className="chat-header-info">
          <div className="chat-name">Koin-chan <span className="badge">AI</span></div>
          <div className="chat-status">
            <span className="status-dot" />
            Financial Advisor Online
          </div>
        </div>
        {loading && <div className="typing-badge">sedang berpikir...</div>}
      </div>

      {/* Starter suggestions */}
      {messages.length === 1 && (
        <div className="starters">
          <div className="starters-label">Mulai percakapan:</div>
          <div className="starters-grid">
            {STARTERS.map((q) => (
              <button key={q} className="starter-chip" onClick={() => send(q)}>
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="messages-area">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`msg-row ${msg.role === "user" ? "msg-user" : "msg-ai"}`}
          >
            {msg.role === "assistant" && (
              <div className="msg-avatar">
                <KoinChan mood={i === messages.length - 1 ? mood : "happy"} size={36} animated={false} />
              </div>
            )}
            <div className={`bubble ${msg.role === "user" ? "bubble-user" : "bubble-ai"}`}>
              {String(msg.content ?? "").split("\n").map((line, j) => (
                <span key={j}>
                  {line}
                  {j < String(msg.content ?? "").split("\n").length - 1 && <br />}
                </span>
              ))}
            </div>
          </div>
        ))}

        {loading && (
          <div className="msg-row msg-ai">
            <div className="msg-avatar">
              <KoinChan mood="thinking" size={36} animated={false} />
            </div>
            <div className="bubble bubble-ai bubble-typing">
              <span className="dot" /><span className="dot" /><span className="dot" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="chat-input-area">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Tanya soal keuangan kamu..."
          rows={1}
          className="chat-textarea"
          disabled={loading}
        />
        <button
          className="send-btn"
          onClick={() => send()}
          disabled={loading || !input.trim()}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}