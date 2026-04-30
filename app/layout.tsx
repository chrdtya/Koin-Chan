import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Koin-chan — AI Financial Advisor",
  description: "Asisten keuangan AI dengan karakter anime yang cute dan smart. Powered by Google Gemini.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}