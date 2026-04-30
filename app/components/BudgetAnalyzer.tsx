"use client";

import { useState } from "react";
import KoinChan from "./KoinChan";

interface ExpenseRow {
  label: string;
  key: string;
  emoji: string;
  color: string;
}

const EXPENSE_ROWS: ExpenseRow[] = [
  { label: "Makanan & Minum", key: "food", emoji: "🍜", color: "#f472b6" },
  { label: "Transportasi", key: "transport", emoji: "🚗", color: "#fb923c" },
  { label: "Tagihan & Utilitas", key: "bills", emoji: "⚡", color: "#facc15" },
  { label: "Hiburan", key: "entertainment", emoji: "🎮", color: "#a78bfa" },
  { label: "Belanja & Lifestyle", key: "shopping", emoji: "🛍️", color: "#34d399" },
  { label: "Kesehatan", key: "health", emoji: "💊", color: "#60a5fa" },
  { label: "Lain-lain", key: "others", emoji: "📦", color: "#94a3b8" },
];

interface AnalysisResult {
  score: number;
  grade: string;
  verdict: string;
  tips: string[];
  breakdown: { needs: number; wants: number; savings: number };
  totalExpenses: number;
  remaining: number;
  savingsRate: number;
}

const fmt = (n: number) =>
  "Rp " + Math.round(n).toLocaleString("id-ID");

// Format angka dengan titik ribuan untuk display di input
const fmtInput = (val: string) => {
  const num = val.replace(/\D/g, ""); // hapus semua non-digit
  if (!num) return "";
  return parseInt(num).toLocaleString("id-ID");
};

// Parse input yang sudah diformat (hapus titik)
const parseInput = (val: string) => val.replace(/\./g, "").replace(/\D/g, "");

export default function BudgetAnalyzer() {
  const [income, setIncome] = useState("");
  const [expenses, setExpenses] = useState<Record<string, string>>({});
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totalExp = EXPENSE_ROWS.reduce(
    (sum, r) => sum + (parseFloat(parseInput(expenses[r.key] || "0")) || 0),
    0
  );
  const inc = parseFloat(parseInput(income || "0")) || 0;
  const sisa = inc - totalExp;

  const analyze = async () => {
    if (!income || inc <= 0) {
      setError("Masukkan pemasukan dulu ya~");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const expObj: Record<string, number> = {};
      EXPENSE_ROWS.forEach((r) => {
        expObj[r.label] = parseFloat(parseInput(expenses[r.key] || "0")) || 0;
      });
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ income: inc, expenses: expObj }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (e) {
      setError("Gagal analisis: " + (e instanceof Error ? e.message : "coba lagi"));
    } finally {
      setLoading(false);
    }
  };

  const gradeColor = (g: string) => {
    const map: Record<string, string> = { A: "#34d399", B: "#60a5fa", C: "#facc15", D: "#fb923c", F: "#f87171" };
    return map[g] ?? "#94a3b8";
  };

  const scoreColor = (s: number) => {
    if (s >= 80) return "#34d399";
    if (s >= 60) return "#60a5fa";
    if (s >= 40) return "#facc15";
    return "#f87171";
  };

  return (
    <div className="analyzer-wrapper">
      {/* Income input */}
      <div className="ana-card">
        <div className="ana-card-title">
          <span>💰</span> Pemasukan Bulanan
        </div>
        <div className="income-input-wrap">
          <span className="currency-label">Rp</span>
          <input
            type="text"
            inputMode="numeric"
            value={income}
            onChange={(e) => setIncome(fmtInput(e.target.value))}
            placeholder="5.000.000"
            className="income-input"
          />
        </div>
      </div>

      {/* Expense rows */}
      <div className="ana-card">
        <div className="ana-card-title">
          <span>📋</span> Rincian Pengeluaran
        </div>
        <div className="expense-list">
          {EXPENSE_ROWS.map((row) => (
            <div key={row.key} className="expense-row">
              <div className="expense-label">
                <span className="expense-emoji">{row.emoji}</span>
                <span>{row.label}</span>
              </div>
              <div className="expense-input-wrap">
                <span className="currency-sm">Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={expenses[row.key] || ""}
                  onChange={(e) =>
                    setExpenses((prev) => ({ ...prev, [row.key]: fmtInput(e.target.value) }))
                  }
                  placeholder="0"
                  className="expense-input"
                  style={{ minWidth: 0 }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Summary bar */}
        {inc > 0 && (
          <div className="summary-bar">
            <div className="summary-row">
              <span>Total Pengeluaran</span>
              <span style={{ color: "#f472b6", fontWeight: 700 }}>{fmt(totalExp)}</span>
            </div>
            <div className="summary-row">
              <span>Sisa / Tabungan</span>
              <span style={{ color: sisa >= 0 ? "#34d399" : "#f87171", fontWeight: 700 }}>
                {fmt(sisa)}
              </span>
            </div>
            {/* Visual progress bar */}
            <div className="progress-track">
              {EXPENSE_ROWS.map((r) => {
                const val = parseFloat(expenses[r.key] || "0") || 0;
                const pct = inc > 0 ? (val / inc) * 100 : 0;
                return pct > 0 ? (
                  <div
                    key={r.key}
                    className="progress-seg"
                    style={{ width: `${Math.min(pct, 100)}%`, background: r.color }}
                    title={`${r.label}: ${pct.toFixed(1)}%`}
                  />
                ) : null;
              })}
            </div>
          </div>
        )}
      </div>

      {error && <div className="error-msg">{error}</div>}

      <button
        className="analyze-btn"
        onClick={analyze}
        disabled={loading}
      >
        {loading ? (
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="spin">⟳</span> Koin-chan sedang analisis...
          </span>
        ) : (
          "✨ Analisis Keuanganku!"
        )}
      </button>

      {/* Result */}
      {result && (
        <div className="result-card">
          {/* Score */}
          <div className="result-top">
            <div className="koin-result">
              <KoinChan
                mood={result.score >= 70 ? "excited" : result.score >= 50 ? "happy" : "thinking"}
                size={72}
              />
            </div>
            <div className="score-block">
              <div
                className="score-num"
                style={{ color: scoreColor(result.score) }}
              >
                {result.score}
              </div>
              <div className="score-label">/ 100</div>
              <div
                className="grade-badge"
                style={{ background: gradeColor(result.grade) + "22", color: gradeColor(result.grade), borderColor: gradeColor(result.grade) }}
              >
                Grade {result.grade}
              </div>
            </div>
          </div>

          <div className="verdict">"{result.verdict}"</div>

          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-label">Pengeluaran</div>
              <div className="stat-val" style={{ color: "#f472b6" }}>{fmt(result.totalExpenses)}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Tabungan</div>
              <div className="stat-val" style={{ color: result.remaining >= 0 ? "#34d399" : "#f87171" }}>
                {fmt(result.remaining)}
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Savings Rate</div>
              <div className="stat-val" style={{ color: result.savingsRate >= 20 ? "#34d399" : "#facc15" }}>
                {result.savingsRate.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Breakdown */}
          {result.breakdown && (
            <div className="breakdown-section">
              <div className="breakdown-title">Alokasi Budget</div>
              <div className="breakdown-bars">
                {[
                  { label: "Kebutuhan", val: result.breakdown.needs, color: "#60a5fa" },
                  { label: "Keinginan", val: result.breakdown.wants, color: "#f472b6" },
                  { label: "Tabungan", val: result.breakdown.savings, color: "#34d399" },
                ].map((b) => (
                  <div key={b.label} className="breakdown-item">
                    <div className="breakdown-label">
                      <span>{b.label}</span>
                      <span style={{ color: b.color }}>{b.val?.toFixed(0)}%</span>
                    </div>
                    <div className="breakdown-track">
                      <div
                        className="breakdown-fill"
                        style={{ width: `${Math.min(b.val || 0, 100)}%`, background: b.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          {result.tips?.length > 0 && (
            <div className="tips-section">
              <div className="tips-title">💡 Tips dari Koin-chan</div>
              {result.tips.map((tip, i) => (
                <div key={i} className="tip-item">
                  <span className="tip-num">{i + 1}</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}