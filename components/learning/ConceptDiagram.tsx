'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

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

interface VisualizationData {
  type: string
  nodes: Node[]
  links: Link[]
}

interface ConceptDiagramProps {
  data: VisualizationData
}

export default function ConceptDiagram({ data }: ConceptDiagramProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !data) return

    // 清除之前的内容
    d3.select(svgRef.current).selectAll("*").remove()

    // 对于流程图类型的可视化
    if (data.type === 'flowchart') {
      renderFlowchart(svgRef.current, data)
    }
  }, [data])

  return (
    <div className="w-full overflow-x-auto bg-white rounded-lg p-4">
      <svg 
        ref={svgRef} 
        className="w-full"
        style={{ minHeight: '400px' }}
      />
    </div>
  )
}

function renderFlowchart(container: SVGSVGElement, data: VisualizationData) {
  const width = 800
  const height = 400
  const margin = { top: 20, right: 20, bottom: 20, left: 20 }

  const svg = d3.select(container)
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

  // 创建力导向图布局
  const simulation = d3.forceSimulation(data.nodes)
    .force('link', d3.forceLink(data.links)
      .id((d: any) => d.id)
      .distance(100))
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('y', d3.forceY(0).strength(0.1))
    .force('x', d3.forceX(0).strength(0.1))

  // 创建箭头标记
  svg.append('defs').append('marker')
    .attr('id', 'arrowhead')
    .attr('viewBox', '-0 -5 10 10')
    .attr('refX', 30)
    .attr('refY', 0)
    .attr('orient', 'auto')
    .attr('markerWidth', 8)
    .attr('markerHeight', 8)
    .append('path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', '#999')

  // 绘制连接线
  const links = svg.append('g')
    .selectAll('line')
    .data(data.links)
    .join('line')
    .attr('stroke', '#999')
    .attr('stroke-width', 2)
    .attr('marker-end', 'url(#arrowhead)')

  // 绘制连接线标签
  const linkLabels = svg.append('g')
    .selectAll('text')
    .data(data.links)
    .join('text')
    .text(d => d.label || '')
    .attr('font-size', '12px')
    .attr('text-anchor', 'middle')
    .attr('dy', -5)

  // 创建节点组
  const nodes = svg.append('g')
    .selectAll('g')
    .data(data.nodes)
    .join('g')
    .call(d3.drag<any, any>()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended))

  // 添加节点形状
  nodes.append('rect')
    .attr('width', 120)
    .attr('height', 40)
    .attr('rx', 5)
    .attr('ry', 5)
    .attr('fill', (d) => {
      switch (d.id) {
        case 'start':
          return '#4CAF50'
        case 'condition':
          return '#2196F3'
        case 'end':
          return '#F44336'
        default:
          return '#9C27B0'
      }
    })
    .attr('x', -60)
    .attr('y', -20)

  // 添加节点文本
  nodes.append('text')
    .text(d => d.label || d.id)
    .attr('text-anchor', 'middle')
    .attr('dy', '0.35em')
    .attr('fill', 'white')
    .attr('font-size', '14px')

  // 更新位置
  simulation.on('tick', () => {
    links
      .attr('x1', (d: any) => d.source.x)
      .attr('y1', (d: any) => d.source.y)
      .attr('x2', (d: any) => d.target.x)
      .attr('y2', (d: any) => d.target.y)

    linkLabels
      .attr('x', (d: any) => (d.source.x + d.target.x) / 2)
      .attr('y', (d: any) => (d.source.y + d.target.y) / 2)

    nodes.attr('transform', (d: any) => `translate(${d.x},${d.y})`)
  })

  // 拖拽函数
  function dragstarted(event: any) {
    if (!event.active) simulation.alphaTarget(0.3).restart()
    event.subject.fx = event.subject.x
    event.subject.fy = event.subject.y
  }

  function dragged(event: any) {
    event.subject.fx = event.x
    event.subject.fy = event.y
  }

  function dragended(event: any) {
    if (!event.active) simulation.alphaTarget(0)
    event.subject.fx = null
    event.subject.fy = null
  }
} 