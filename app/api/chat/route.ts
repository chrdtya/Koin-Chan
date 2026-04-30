import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `Kamu adalah Koin-chan, asisten keuangan AI yang ceria dan smart dengan kepribadian anime girl. Kamu ahli dalam budgeting, investasi, menabung, tips hemat, dan perencanaan keuangan. Gaya bicara friendly, kadang pakai ~, ara ara, ekspresi anime yang natural. Jawab dalam Bahasa Indonesia, ringkas dan actionable.`;

const MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.5-pro"];

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "API key not configured" }, { status: 500 });

    const allMessages = messages as { role: string; content: string }[];
    const historyMessages = allMessages.slice(0, -1);
    const filteredHistory = historyMessages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));
    const startIdx = filteredHistory.findIndex((m) => m.role === "user");
    const cleanHistory = startIdx >= 0 ? filteredHistory.slice(startIdx) : [];
    const lastMessage = allMessages[allMessages.length - 1];
    if (!lastMessage || lastMessage.role !== "user") {
      return NextResponse.json({ error: "Last message must be from user" }, { status: 400 });
    }

    let lastError: Error | null = null;
    for (const modelName of MODELS) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelName, systemInstruction: SYSTEM_PROMPT });
        const chat = model.startChat({ history: cleanHistory });
        const result = await chat.sendMessage(lastMessage.content);
        return NextResponse.json({ message: result.response.text() });
      } catch (err) {
        console.warn(`Model ${modelName} failed:`, err);
        lastError = err instanceof Error ? err : new Error(String(err));
        const msg = lastError.message ?? "";
        if (!msg.includes("503") && !msg.includes("429") && !msg.includes("404")) throw lastError;
      }
    }
    throw lastError ?? new Error("All models failed");
  } catch (err: unknown) {
    console.error("Chat API error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}