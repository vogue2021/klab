'use client'

import { useEffect, useRef, useState } from 'react'
import { Minus, Plus, MoveIcon } from 'lucide-react'
import * as d3 from 'd3'
import mermaid from 'mermaid'

interface FlowchartCanvasProps {
  chart: string
  className?: string
}

export default function FlowchartCanvas({ chart, className = '' }: FlowchartCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [scale, setScale] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [dragNode, setDragNode] = useState<any>(null)

  useEffect(() => {
    const renderChart = async () => {
      if (!containerRef.current) return

      try {
        // mermaidを設定
        mermaid.initialize({
          startOnLoad: true,
          theme: 'default',
          securityLevel: 'loose',
          flowchart: {
            htmlLabels: true,
            curve: 'basis',
            nodeSpacing: 50,
            rankSpacing: 50,
          }
        })

        // フローチャートをレンダリング
        const { svg } = await mermaid.render('flowchart', chart)
        
        // コンテナをクリア
        if (containerRef.current) {
          containerRef.current.innerHTML = svg
        }

        // 新しいSVG要素を取得
        const svgElement = containerRef.current.querySelector('svg')
        if (svgElement) {
          svgRef.current = svgElement
          
          // SVGスタイルを設定
          svgElement.style.width = '100%'
          svgElement.style.height = '100%'
          
          // インタラクションを初期化
          initializeInteractions(svgElement)
        }
      } catch (error) {
        console.error('Flowchart render error:', error)
      }
    }

    renderChart()
  }, [chart])

  const initializeInteractions = (svg: SVGSVGElement) => {
    const nodes = svg.querySelectorAll('.node')
    
    nodes.forEach(node => {
      // ドラッグ機能を追加
      d3.select(node)
        .call(d3.drag()
          .on('start', dragStarted)
          .on('drag', dragged)
          .on('end', dragEnded))
        
      // 重要なノードに特別なスタイルを追加
      if (node.textContent?.includes('[重要]')) {
        node.classList.add('important-node')
      }
    })
  }

  const dragStarted = (event: any) => {
    setIsDragging(true)
    setDragNode(event.subject)
  }

  const dragged = (event: any) => {
    if (!isDragging || !dragNode) return

    const node = event.subject
    node.x = event.x
    node.y = event.y
    
    // ノードの位置を更新
    d3.select(event.sourceEvent.target.closest('.node'))
      .attr('transform', `translate(${event.x},${event.y})`)
    
    // エッジを更新
    updateEdges()
  }

  const dragEnded = () => {
    setIsDragging(false)
    setDragNode(null)
  }

  const updateEdges = () => {
    if (!svgRef.current) return
    
    const edges = svgRef.current.querySelectorAll('.edge')
    edges.forEach(edge => {
      // エッジのパスを更新
      const path = edge.querySelector('path')
      if (path) {
        // カスタムパス計算ロジックをここに追加できます
      }
    })
  }

  const handleZoom = (delta: number) => {
    const newScale = Math.max(0.5, Math.min(2, scale + delta))
    setScale(newScale)
    
    if (svgRef.current) {
      const svg = d3.select(svgRef.current)
      svg.attr('transform', `scale(${newScale})`)
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* フローチャートコンテナ */}
      <div 
        ref={containerRef}
        className="w-full h-full overflow-hidden"
        style={{ 
          cursor: isDragging ? 'grabbing' : 'grab',
          touchAction: 'none'
        }}
      />
      
      {/* ズームコントロールボタン */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 bg-white rounded-lg shadow-lg">
        <button
          onClick={() => handleZoom(0.1)}
          className="p-2 hover:bg-gray-100 rounded-t-lg"
          title="拡大"
        >
          <Plus className="w-5 h-5" />
        </button>
        <div className="h-px bg-gray-200" />
        <button
          onClick={() => handleZoom(-0.1)}
          className="p-2 hover:bg-gray-100 rounded-b-lg"
          title="縮小"
        >
          <Minus className="w-5 h-5" />
        </button>
      </div>

      {/* ドラッグ通知 */}
      {isDragging && (
        <div className="absolute top-4 left-4 bg-black/75 text-white px-3 py-1 rounded-full text-sm">
          <div className="flex items-center gap-2">
            <MoveIcon className="w-4 h-4" />
            <span>ノードを移動中</span>
          </div>
        </div>
      )}
    </div>
  )
} 