'use client'

import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'

interface MermaidProps {
  chart: string
}

export default function Mermaid({ chart }: MermaidProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const renderChart = async () => {
      if (!containerRef.current) return

      try {
        // mermaidを初期化
        mermaid.initialize({
          startOnLoad: true,
          theme: 'default',
          securityLevel: 'loose',
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
            curve: 'basis'
          }
        })

        // 以前のコンテンツをクリア
        containerRef.current.innerHTML = ''

        // ユニークIDを生成
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`
        
        // チャートをレンダリング
        const { svg } = await mermaid.render(id, chart)
        if (containerRef.current) {
          containerRef.current.innerHTML = svg
        }
      } catch (err) {
        console.error('Mermaid render error:', err)
        setError('チャートのレンダリングに失敗しました')
      }
    }

    renderChart()
  }, [chart])

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-50 rounded-lg">
        {error}
        <pre className="mt-2 text-sm text-gray-600 overflow-auto">
          {chart}
        </pre>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef} 
      className="mermaid overflow-auto"
    />
  )
} 