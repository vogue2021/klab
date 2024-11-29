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
        // 初始化 mermaid
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

        // 清除之前的内容
        containerRef.current.innerHTML = ''

        // 生成唯一ID
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`
        
        // 渲染图表
        const { svg } = await mermaid.render(id, chart)
        if (containerRef.current) {
          containerRef.current.innerHTML = svg
        }
      } catch (err) {
        console.error('Mermaid render error:', err)
        setError('图表渲染失败')
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