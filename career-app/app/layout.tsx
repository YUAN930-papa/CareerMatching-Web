import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "求职助手",
  description: "AI 简历优化 · JD 匹配分析 · 求职追踪",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  );
}
