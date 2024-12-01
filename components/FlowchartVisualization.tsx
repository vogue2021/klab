'use client'

import { useEffect, useState, useRef } from 'react'
import * as d3 from 'd3'
import { Plus, Minus } from 'lucide-react'

interface FlowchartVisualizationProps {
  code: string
}

interface Node {
  id: string
  label: string
  type?: string
}

interface Link {
  source: string
  target: string
  label?: string
}

export default function FlowchartVisualization({ code }: FlowchartVisualizationProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 })
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [analysis, setAnalysis] = useState<string>('')

  // 添加节点类型和颜色配置
  const nodeStyles = {
    start: {
      fill: '#4CAF50',
      stroke: '#2E7D32',
      shape: 'circle',
      radius: 30,
    },
    end: {
      fill: '#F44336',
      stroke: '#C62828',
      shape: 'circle',
      radius: 30,
    },
    condition: {
      fill: '#2196F3',
      stroke: '#1565C0',
      shape: 'diamond',
      width: 120,
      height: 80,
    },
    loop: {
      fill: '#FFC107',
      stroke: '#FFA000',
      shape: 'hexagon',
      width: 120,
      height: 60,
    },
    function: {
      fill: '#9C27B0',
      stroke: '#7B1FA2',
      shape: 'rect',
      width: 140,
      height: 60,
      rx: 15,
    },
    important: {
      fill: '#E91E63',
      stroke: '#C2185B',
      shape: 'star',
      size: 60,
    },
    process: {
      fill: '#69b3a2',
      stroke: '#4a8072',
      shape: 'rect',
      width: 120,
      height: 50,
      rx: 8,
    }
  }

  const renderFlowchart = (nodes: Node[], links: Link[]) => {
    if (!containerRef.current) return

    // 清空容器
    containerRef.current.innerHTML = ''

    // 设置画布尺寸
    const width = containerRef.current.clientWidth
    const height = containerRef.current.clientHeight
    const margin = { top: 20, right: 20, bottom: 50, left: 20 }

    // 创建SVG
    const svg = d3.select(containerRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])
    
    svgRef.current = svg.node()

    // 创建缩放行为
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4]) // 设置缩放范围
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
        setTransform(event.transform)
      })

    svg.call(zoom as any)

    // 创建主要的图形容器
    const g = svg.append('g')
      .attr('class', 'graph-container')

    // 创建力导向图布局
    const simulation = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-500))
      .force('center', d3.forceCenter(width / 2, height / 2))

    // 绘制连接线
    const link = g.append('g')
      .selectAll('g')
      .data(links)
      .join('g')

    // 添加连接线路径
    link.append('path')
      .attr('class', 'link')
      .attr('stroke', '#999')
      .attr('stroke-width', 2)
      .attr('fill', 'none')
      .attr('marker-end', 'url(#arrowhead)')

    // 添加连接线标签
    link.append('text')
      .attr('class', 'link-label')
      .attr('text-anchor', 'middle')
      .attr('dy', -5)
      .text(d => d.label || '')
      .style('fill', '#666')
      .style('font-size', '12px')

    // 创建节点
    const node = g.append('g')
      .selectAll('.node')
      .data(nodes)
      .join('g')
      .attr('class', 'node')
      .call(d3.drag()
        .on('start', dragStarted)
        .on('drag', dragged)
        .on('end', dragEnded)
      )

    // 根据节点类型渲染不同的形状
    node.each(function(d: any) {
      const nodeGroup = d3.select(this)
      const style = nodeStyles[d.type || 'process']

      switch (style.shape) {
        case 'circle':
          nodeGroup.append('circle')
            .attr('r', style.radius)
            .attr('fill', style.fill)
            .attr('stroke', style.stroke)
            .attr('stroke-width', 2)
            .attr('class', 'node-shape')
          break

        case 'diamond':
          nodeGroup.append('path')
            .attr('d', d3.symbol().type(d3.symbolDiamond).size(style.width * style.height))
            .attr('fill', style.fill)
            .attr('stroke', style.stroke)
            .attr('stroke-width', 2)
            .attr('class', 'node-shape')
          break

        case 'hexagon':
          const hexagonPath = createHexagonPath(style.width, style.height)
          nodeGroup.append('path')
            .attr('d', hexagonPath)
            .attr('fill', style.fill)
            .attr('stroke', style.stroke)
            .attr('stroke-width', 2)
            .attr('class', 'node-shape')
          break

        case 'star':
          nodeGroup.append('path')
            .attr('d', d3.symbol().type(d3.symbolStar).size(style.size * style.size))
            .attr('fill', style.fill)
            .attr('stroke', style.stroke)
            .attr('stroke-width', 2)
            .attr('class', 'node-shape')
          break

        default: // rect
          nodeGroup.append('rect')
            .attr('width', style.width)
            .attr('height', style.height)
            .attr('x', -style.width / 2)
            .attr('y', -style.height / 2)
            .attr('rx', style.rx || 0)
            .attr('ry', style.rx || 0)
            .attr('fill', style.fill)
            .attr('stroke', style.stroke)
            .attr('stroke-width', 2)
            .attr('class', 'node-shape')
      }

      // 添加发光效果（用于重要节点）
      if (d.important) {
        const glow = nodeGroup.append('filter')
          .attr('id', `glow-${d.id}`)
          .attr('x', '-50%')
          .attr('y', '-50%')
          .attr('width', '200%')
          .attr('height', '200%')

        glow.append('feGaussianBlur')
          .attr('stdDeviation', '3')
          .attr('result', 'coloredBlur')

        const feMerge = glow.append('feMerge')
        feMerge.append('feMergeNode')
          .attr('in', 'coloredBlur')
        feMerge.append('feMergeNode')
          .attr('in', 'SourceGraphic')

        nodeGroup.select('.node-shape')
          .style('filter', `url(#glow-${d.id})`)
      }

      // 添加文本
      const text = nodeGroup.append('text')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', 'white')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .attr('pointer-events', 'none')
        .text(d.label)

      // 文本换行处理
      wrap(text, style.width || 100)
    })

    // 添加箭头标记
    svg.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 20)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .append('path')
      .attr('d', 'M 0,-5 L 10,0 L 0,5')
      .attr('fill', '#999')

    // 更新力导向图
    simulation.on('tick', () => {
      link.select('path')
        .attr('d', (d: any) => {
          const dx = d.target.x - d.source.x
          const dy = d.target.y - d.source.y
          const dr = Math.sqrt(dx * dx + dy * dy)
          return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`
        })

      link.select('text')
        .attr('transform', (d: any) => {
          const x = (d.source.x + d.target.x) / 2
          const y = (d.source.y + d.target.y) / 2
          return `translate(${x},${y})`
        })

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`)
    })

    // 拖拽函数
    function dragStarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      event.subject.fx = event.subject.x
      event.subject.fy = event.subject.y
    }

    function dragged(event: any) {
      event.subject.fx = event.x
      event.subject.fy = event.y
    }

    function dragEnded(event: any) {
      if (!event.active) simulation.alphaTarget(0)
      event.subject.fx = null
      event.subject.fy = null
    }

    // 文本换行函数
    function wrap(text: any, width: number) {
      text.each(function() {
        const text = d3.select(this)
        const words = text.text().split(/\s+/).reverse()
        let word
        let line: string[] = []
        let lineNumber = 0
        const lineHeight = 1.1
        const y = text.attr("y")
        const dy = parseFloat(text.attr("dy")) || 0
        let tspan = text.text(null).append("tspan")
          .attr("x", 0)
          .attr("y", y)
          .attr("dy", dy + "em")
        
        while (word = words.pop()) {
          line.push(word)
          tspan.text(line.join(" "))
          if (tspan.node()?.getComputedTextLength() > width) {
            line.pop()
            tspan.text(line.join(" "))
            line = [word]
            tspan = text.append("tspan")
              .attr("x", 0)
              .attr("y", y)
              .attr("dy", ++lineNumber * lineHeight + dy + "em")
              .text(word)
          }
        }
      })
    }
  }

  // 添加缩放控制函数
  const handleZoom = (direction: 'in' | 'out') => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    const zoom = d3.zoom().scaleExtent([0.1, 4])
    
    const duration = 250
    const scale = direction === 'in' ? transform.k * 1.2 : transform.k / 1.2

    svg.transition()
      .duration(duration)
      .call(
        zoom.transform as any,
        d3.zoomIdentity
          .translate(transform.x, transform.y)
          .scale(scale)
      )
  }

  // 添加重置缩放函数
  const handleResetZoom = () => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    const zoom = d3.zoom().scaleExtent([0.1, 4])
    
    svg.transition()
      .duration(250)
      .call(
        zoom.transform as any,
        d3.zoomIdentity
      )
  }

  // 处理代码分析和流程图生成
  useEffect(() => {
    const analyzeCode = async () => {
      if (!code.trim()) return
      setLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/analyze-code-flow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || '代码分析失败')
        }

        if (!data.nodes || !data.links) {
          throw new Error('流程图数据格式错误')
        }

        // 保存 AI 分析结果
        if (data.analysis) {
          setAnalysis(data.analysis)
        }

        // 渲染流程图
        renderFlowchart(data.nodes, data.links)

      } catch (err) {
        console.error('Flowchart error:', err)
        setError(err instanceof Error ? err.message : '生成流程图失败')
      } finally {
        setLoading(false)
      }
    }

    const debounceTimeout = setTimeout(analyzeCode, 1000)
    return () => clearTimeout(debounceTimeout)
  }, [code])

  // 辅助函数：创建六边形路径
  function createHexagonPath(width: number, height: number) {
    const w = width / 2
    const h = height / 2
    return `M ${-w},0 L ${-w/2},${-h} L ${w/2},${-h} L ${w},0 L ${w/2},${h} L ${-w/2},${h} Z`
  }

  return (
    <div className="relative h-full flex flex-col bg-white rounded-lg p-4 gap-4">
      {/* 流程图区域 */}
      <div className="flex-1 min-h-[400px] border border-gray-200 rounded-lg shadow-sm">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        )}
        
        {error ? (
          <div className="flex-1 flex items-center justify-center text-red-500">
            <div className="text-center">
              <p>{error}</p>
              <button 
                onClick={() => setError(null)}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                重试
              </button>
            </div>
          </div>
        ) : (
          <div className="relative h-full">
            <div 
              ref={containerRef}
              className="w-full h-full overflow-hidden bg-gray-50 rounded-lg"
            />
            
            {/* 缩放控制面板 */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-2 bg-white rounded-lg shadow-lg">
              <button
                onClick={() => handleZoom('in')}
                className="p-2 hover:bg-gray-100 rounded-t-lg transition-colors"
                title="放大"
              >
                <Plus className="w-5 h-5" />
              </button>
              <div className="h-px bg-gray-200" />
              <button
                onClick={() => handleZoom('out')}
                className="p-2 hover:bg-gray-100 transition-colors"
                title="缩小"
              >
                <Minus className="w-5 h-5" />
              </button>
              <div className="h-px bg-gray-200" />
              <button
                onClick={handleResetZoom}
                className="p-2 hover:bg-gray-100 rounded-b-lg transition-colors text-xs"
                title="重置缩放"
              >
                重置
              </button>
            </div>

            {/* 缩放比例显示 */}
            <div className="absolute top-4 right-4 bg-white px-2 py-1 rounded-md shadow-sm text-sm text-gray-600">
              {Math.round(transform.k * 100)}%
            </div>
          </div>
        )}
      </div>

      {/* AI 分析结果显示区域 */}
      {analysis && (
        <div className="border border-gray-200 rounded-lg shadow-sm bg-white">
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800">代码分析</h3>
          </div>
          <div className="p-4 max-h-[300px] overflow-y-auto custom-scrollbar">
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {analysis}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// 添加到全局样式文件 (globals.css)
/*
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #CBD5E0 #EDF2F7;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #EDF2F7;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #CBD5E0;
  border-radius: 3px;
  border: 2px solid #EDF2F7;
}
*/

