'use client'

import { useState } from 'react'

interface CodeAnalyzerProps {
  onAnalysis: (explanation: string) => void
}

export default function CodeAnalyzer({ onAnalysis }: CodeAnalyzerProps) {
  const [code, setCode] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const analyzeCode = async () => {
    if (!code.trim()) return

    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/analyze-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      })

      if (!response.ok) {
        throw new Error('コード分析に失敗しました')
      }

      const { explanation } = await response.json()
      onAnalysis(explanation)
    } catch (err) {
      console.error('コード分析に失敗しました:', err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full h-48 p-4 font-mono text-sm border rounded-lg"
          placeholder="ここにPythonコードを入力してください..."
        />
      </div>
      <button
        onClick={analyzeCode}
        disabled={isAnalyzing || !code.trim()}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
      >
        {isAnalyzing ? '分析中...' : 'コードを分析'}
      </button>
    </div>
  )
} 