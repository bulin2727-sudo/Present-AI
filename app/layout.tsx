import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PresentAI Coach",
  description: "Real-time audio transcription and AI-powered grading.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50">{children}</body>
    </html>
  );
}