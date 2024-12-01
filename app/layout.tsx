import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import FloatingButton from '@/components/FloatingButton'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Python可视化学习平台",
  description: "面向初学者的Python交互式学习平台",
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
