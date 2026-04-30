"use client";

import { useState } from "react";
import KoinChan from "./components/KoinChan";
import AIChat from "./components/AIChat";
import BudgetAnalyzer from "./components/BudgetAnalyzer";
import "./globals.css";

export default function Home() {
  const [tab, setTab] = useState<"chat" | "analyzer">("chat");

  return (
    <main className="app-root">

      {/* 🔥 NAVBAR (LOGO ONLY) */}
      <div className="navbar">
        <img src="/logo.svg" alt="Koin-chan Logo" className="logo-nav" />
      </div>

      {/* 🔥 HERO (CHARACTER ONLY) */}
      <div className="hero">
        <div className="hero-avatar">
          <KoinChan mood="excited" size={100} />
        </div>

        <h1 className="hero-title">Koin-chan</h1>

        <p className="hero-sub">
          AI Financial Advisor — belajar keuangan jadi fun! ✨
        </p>

        <div className="hero-chips">
          <span className="hero-chip">🤖 Powered by Gemini AI</span>
          <span className="hero-chip">💰 Budget Analyzer</span>
          <span className="hero-chip">📊 Financial Tips</span>
        </div>
      </div>

      {/* 🔥 TABS */}
      <div className="tabs">
        <button
          className={`tab ${tab === "chat" ? "active" : ""}`}
          onClick={() => setTab("chat")}
        >
          💬 Chat dengan Koin-chan
        </button>
        <button
          className={`tab ${tab === "analyzer" ? "active" : ""}`}
          onClick={() => setTab("analyzer")}
        >
          📊 Analisis Budget
        </button>
      </div>

      {/* 🔥 CONTENT */}
      {tab === "chat" ? <AIChat /> : <BudgetAnalyzer />}

      {/* 🔥 FOOTER */}
      <div className="footer">
        Made with 💜 by Koin-chan · Powered by Google Gemini AI
      </div>
    </main>
  );
}