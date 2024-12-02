import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import FloatingButton from '@/components/FloatingButton'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pythonビジュアル学習プラットフォーム",
  description: "初学者向けのPython対話型学習プラットフォーム",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js"></script>
      </head>
      <body>
        <div className="flex h-screen">
          {/* <Sidebar /> */}
          <main className="flex-1">
            {children}
          </main>
        </div>
        <FloatingButton />
      </body>
    </html>
  )
}
