'use client'

import { useEffect, useRef } from 'react'
import mermaid from 'mermaid'

interface MermaidProps {
  chart: string
  config?: {
    theme?: 'default' | 'neutral' | 'dark' | 'forest' | 'base'
    flowchart?: {
      curve?: 'basis' | 'linear' | 'cardinal'
      nodeSpacing?: number
      rankSpacing?: number
      padding?: number
    }
  }
}

export default function Mermaid({ chart, config }: MermaidProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    mermaid.initialize({
      startOnLoad: true,
      theme: config?.theme || 'neutral',
      flowchart: {
        curve: config?.flowchart?.curve || 'basis',
        nodeSpacing: config?.flowchart?.nodeSpacing || 50,
        rankSpacing: config?.flowchart?.rankSpacing || 50,
        padding: config?.flowchart?.padding || 10,
        htmlLabels: true,
        useMaxWidth: true
      },
      securityLevel: 'loose'
    })

    const renderChart = async () => {
      try {
        containerRef.current!.innerHTML = ''
        const { svg } = await mermaid.render(
          `mermaid-${Math.random().toString(36).substr(2, 9)}`,
          chart
        )
        
        const styledSvg = svg.replace(
          '<svg ',
          '<svg style="max-width: 100%; height: auto; display: block; margin: auto;" '
        )
        
        containerRef.current!.innerHTML = styledSvg
      } catch (error) {
        console.error('チャートのレンダリングに失敗:', error)
        containerRef.current!.innerHTML = '<p class="text-red-500">チャートのレンダリングに失敗しました</p>'
      }
    }

    renderChart()
  }, [chart, config])

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full flex items-center justify-center p-4"
    />
  )
} 