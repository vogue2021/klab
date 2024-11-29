'use client'

import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

interface MindMapNode {
  name: string
  children?: MindMapNode[]
}

// 定义配色方案
const colors = {
  root: {
    bg: '#4F46E5', // 靛蓝色
    text: '#FFFFFF'
  },
  level1: {
    bg: '#818CF8', // 浅靛蓝色
    text: '#FFFFFF'
  },
  level2: {
    bg: '#E0E7FF', // 最浅靛蓝色
    text: '#1E1B4B'
  },
  link: '#C7D2FE' // 连接线颜色
}

export default function MindMap({ code }: { code: string }) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [data, setData] = useState<MindMapNode | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!code) return

    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/analyze-mindmap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        })

        if (!response.ok) {
          throw new Error('Failed to fetch mindmap data')
        }

        const result = await response.json()
        setData(result)
      } catch (err) {
        console.error('Error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [code])

  useEffect(() => {
    if (!data || !svgRef.current || !containerRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const containerWidth = containerRef.current.clientWidth
    const containerHeight = containerRef.current.clientHeight

    svg
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', [0, 0, containerWidth, containerHeight])

    // 添加渐变背景
    const defs = svg.append('defs')
    const gradient = defs.append('linearGradient')
      .attr('id', 'link-gradient')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%')

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', colors.level1.bg)
    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', colors.level2.bg)

    const zoom = d3.zoom()
      .scaleExtent([0.5, 2])
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
      })

    svg.call(zoom as any)

    const g = svg.append('g')
      .attr('transform', `translate(${containerWidth / 4}, ${containerHeight / 2})`)

    const root = d3.hierarchy(data)

    const treeLayout = d3.tree<MindMapNode>()
      .size([containerHeight * 0.8, containerWidth * 0.5])
      .separation((a, b) => (a.parent === b.parent ? 2 : 3))

    treeLayout(root)

    // 绘制连接线
    const links = g.append('g')
      .attr('class', 'links')
      .selectAll('path')
      .data(root.links())
      .join('path')
      .attr('d', d3.linkHorizontal()
        .x(d => (d as any).y)
        .y(d => (d as any).x)
      )
      .attr('fill', 'none')
      .attr('stroke', 'url(#link-gradient)')
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.8)

    // 创建节点组
    const nodes = g.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(root.descendants())
      .join('g')
      .attr('transform', d => `translate(${d.y},${d.x})`)

    // 添加节点背景
    nodes.append('rect')
      .attr('class', 'node-bg')
      .attr('rx', 8)
      .attr('ry', 8)
      .attr('fill', d => {
        if (d.depth === 0) return colors.root.bg
        if (d.depth === 1) return colors.level1.bg
        return colors.level2.bg
      })
      .attr('stroke', 'none')
      .attr('filter', 'drop-shadow(0 4px 3px rgb(0 0 0 / 0.07))')
      .attr('x', d => d.children ? -130 : -55)
      .attr('y', -15)
      .attr('width', 110)
      .attr('height', 30)

    // 添加节点文本
    const nodeTexts = nodes.append('text')
      .attr('class', 'node-text')
      .attr('dy', '0.31em')
      .attr('x', d => d.children ? -75 : 0)
      .attr('text-anchor', 'middle')
      .attr('fill', d => {
        if (d.depth === 0) return colors.root.text
        if (d.depth === 1) return colors.level1.text
        return colors.level2.text
      })
      .attr('font-size', d => d.depth === 0 ? '16px' : '14px')
      .attr('font-weight', d => d.depth === 0 ? '600' : '500')
      .text(d => d.data.name)

    // 自动换行和调整背景框
    nodeTexts.each(function(d) {
      const text = d3.select(this)
      const words = text.text().split(/(?<=[\u4e00-\u9fa5])|(?<=\s)|(?=\s)/)
      const lineHeight = 1.2
      const width = d.depth === 0 ? 120 : 100
      let line: string[] = []
      let lineNumber = 0
      const x = text.attr('x')
      let tspan = text.text(null).append('tspan')
        .attr('x', x)
        .attr('dy', 0)

      words.forEach(word => {
        line.push(word)
        tspan.text(line.join(''))
        if ((tspan.node()?.getComputedTextLength() || 0) > width) {
          line.pop()
          tspan.text(line.join(''))
          line = [word]
          tspan = text.append('tspan')
            .attr('x', x)
            .attr('dy', `${lineHeight}em`)
            .text(word)
          lineNumber++
        }
      })

      // 调整背景矩形
      const parentNode = d3.select((this as any).parentNode)
      const rect = parentNode.select('rect')
      const textHeight = (lineNumber + 1) * lineHeight * (d.depth === 0 ? 18 : 16)
      rect.attr('height', textHeight + 20)
        .attr('y', -(textHeight + 20) / 2)
        .attr('width', d.depth === 0 ? 140 : 110)
    })

    // 初始缩放以适应视图
    const bounds = g.node()?.getBBox()
    if (bounds) {
      const dx = bounds.width
      const dy = bounds.height
      const x = bounds.x
      const y = bounds.y
      const scale = 0.9 / Math.max(dx / containerWidth, dy / containerHeight)
      const translate = [containerWidth / 2 - scale * (x + dx / 2), containerHeight / 2 - scale * (y + dy / 2)]
      
      svg.transition()
        .duration(750)
        .call(
          zoom.transform as any,
          d3.zoomIdentity
            .translate(translate[0], translate[1])
            .scale(scale)
        )
    }

  }, [data])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        错误: {error}
      </div>
    )
  }

  return (
    <div ref={containerRef} className="w-full h-full bg-gradient-to-br from-indigo-50 to-white">
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  )
} 