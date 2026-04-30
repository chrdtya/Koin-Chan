import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.5-pro"];

async function generateWithFallback(apiKey: string, prompt: string): Promise<string> {
  let lastError: Error | null = null;
  for (const modelName of MODELS) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      console.warn(`Model ${modelName} failed:`, err);
      lastError = err instanceof Error ? err : new Error(String(err));
      const msg = lastError.message ?? "";
      if (!msg.includes("503") && !msg.includes("429") && !msg.includes("404")) throw lastError;
    }
  }
  throw lastError ?? new Error("All models failed");
}

export async function POST(req: NextRequest) {
  try {
    const { income, expenses } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "API key not configured" }, { status: 500 });

    const totalExpenses = Object.values(expenses as Record<string, number>).reduce(
      (sum: number, val) => sum + (Number(val) || 0), 0
    );
    const remaining = income - totalExpenses;
    const savingsRate = income > 0 ? ((remaining / income) * 100).toFixed(1) : "0";

    const prompt = `Kamu adalah Koin-chan, asisten keuangan AI. Kembalikan HANYA JSON valid ini (tanpa markdown, tanpa teks lain):
{"score":75,"grade":"B","verdict":"Keuangan cukup sehat","tips":["tip 1","tip 2","tip 3"],"breakdown":{"needs":60,"wants":20,"savings":20}}

Data keuangan:
- Pemasukan: Rp ${income.toLocaleString("id-ID")}
- Total pengeluaran: Rp ${totalExpenses.toLocaleString("id-ID")}
- Sisa: Rp ${remaining.toLocaleString("id-ID")} (${savingsRate}%)
- Rincian: ${JSON.stringify(expenses)}

Score: 80-100=sangat baik, 60-79=cukup, 40-59=perlu perbaikan, 0-39=kritis. Tips dalam Bahasa Indonesia.`;

    const text = await generateWithFallback(apiKey, prompt);
    let jsonText = text.trim().replace(/\`\`\`json\s*/gi, "").replace(/\`\`\`\s*/g, "").trim();
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Response tidak valid dari AI");

    const analysis = JSON.parse(jsonMatch[0]);
    return NextResponse.json({
      score: analysis.score ?? 50,
      grade: analysis.grade ?? "C",
      verdict: analysis.verdict ?? "Analisis selesai",
      tips: analysis.tips ?? [],
      breakdown: analysis.breakdown ?? { needs: 60, wants: 20, savings: 20 },
      totalExpenses,
      remaining,
      savingsRate: parseFloat(savingsRate),
    });
  } catch (err: unknown) {
    console.error("Analyze API error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}