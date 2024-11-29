'use client'

import { useRef, useEffect, useState } from 'react'
import * as d3 from 'd3'
import { Plus, Minus, RotateCcw } from 'lucide-react'

interface MindmapNode {
  id: string;
  label: string;
  children?: MindmapNode[];
}

export default function MindmapVisualization({ code }: { code: string }) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!code || !svgRef.current || !containerRef.current) return

    const fetchAndRender = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/analyze-mindmap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code })
        })

        if (!response.ok) throw new Error('Failed to fetch mindmap data')
        const data = await response.json()

        // 渲染思维导图
        const svg = d3.select(svgRef.current)
        svg.selectAll('*').remove()

        // ... 思维导图渲染逻辑 ...

      } catch (err) {
        console.error('Error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchAndRender()
  }, [code])

  return (
    <div className="w-full h-full flex flex-col bg-gray-50">
      <div className="h-12 border-b bg-white px-4 flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-700">思维导图</h2>
      </div>

      <div ref={containerRef} className="flex-1 relative overflow-hidden">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
            <div className="text-red-500">错误: {error}</div>
          </div>
        ) : (
          <svg 
            ref={svgRef} 
            className="w-full h-full"
            style={{ 
              cursor: 'grab',
              backgroundColor: '#ffffff',
              backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)',
              backgroundSize: '50px 50px'
            }}
          />
        )}
      </div>
    </div>
  )
} 