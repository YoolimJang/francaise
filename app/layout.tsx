import type { Metadata } from "next";
import { Newsreader } from "next/font/google";
import "./globals.css";

const serif = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Française — 프랑스어 공부",
  description: "알파벳부터 문법·단어·표현까지, 단계별 프랑스어 학습 노트.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={serif.variable}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
