'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import Mermaid from './Mermaid'

interface Visualization {
  type: 'function-call' | 'data-flow' | 'type-relation' | 'adt' | 'monad' | 'functor'
  description: string
  elements: {
    id: string
    type: string
    label: string
  }[]
  connections: {
    from: string
    to: string
    label: string
  }[]
}

interface Section {
  title: string
  content: string
  codeExample: string
  explanation: string
  visualizations: Visualization[]
}

interface Props {
  section: Section
}

export default function VisualContent({ section }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !section.visualizations?.length) return

    section.visualizations.forEach(viz => {
      switch (viz.type) {
        case 'function-call':
          renderFunctionCallDiagram(viz)
          break
        case 'data-flow':
          renderDataFlowDiagram(viz)
          break
        case 'type-relation':
          renderTypeRelationDiagram(viz)
          break
        case 'adt':
          renderADTDiagram(viz)
          break
        case 'monad':
          renderMonadDiagram(viz)
          break
        case 'functor':
          renderFunctorDiagram(viz)
          break
      }
    })
  }, [section])

  const renderFunctionCallDiagram = (viz: Visualization) => {
    // 函数调用图的渲染逻辑
    const svg = d3.select(svgRef.current)
    // ... 使用 d3.js 渲染函数调用图
  }

  const renderDataFlowDiagram = (viz: Visualization) => {
    // 数据流图的渲染逻辑
  }

  const renderTypeRelationDiagram = (viz: Visualization) => {
    // 类型关系图的渲染逻辑
  }

  const renderADTDiagram = (viz: Visualization) => {
    // 代数数据类型图的渲染逻辑
  }

  const renderMonadDiagram = (viz: Visualization) => {
    // Monad操作图的渲染逻辑
  }

  const renderFunctorDiagram = (viz: Visualization) => {
    // 函子图的渲染逻辑
  }

  const getMermaidChart = (viz: Visualization) => {
    // 添加图表大小控制
    const config = `%%{init: {'theme': 'neutral', 'flowchart': {'htmlLabels': true, 'padding': 10, 'nodeSpacing': 50, 'rankSpacing': 50}}}%%`
    
    switch (viz.type) {
      case 'function-call':
        return `
          ${config}
          graph TD
            ${viz.elements.map(el => `${el.id}["${el.label}"]`).join('\n  ')}
            ${viz.connections.map(conn => `${conn.from} -->|"${conn.label}"| ${conn.to}`).join('\n  ')}
          classDef default fill:#f9f9f9,stroke:#666,stroke-width:2px;
          classDef highlight fill:#e3f2fd,stroke:#42a5f5,stroke-width:2px;
        `
      case 'data-flow':
        return `
          ${config}
          graph LR
            ${viz.elements.map(el => `${el.id}["${el.label}"]`).join('\n  ')}
            ${viz.connections.map(conn => `${conn.from} -->|"${conn.label}"| ${conn.to}`).join('\n  ')}
          classDef default fill:#f9f9f9,stroke:#666,stroke-width:2px;
          classDef highlight fill:#e3f2fd,stroke:#42a5f5,stroke-width:2px;
        `
      case 'type-relation':
        return `
          graph TB
            ${viz.elements.map(el => `${el.id}["${el.label}"]`).join('\n  ')}
            ${viz.connections.map(conn => `${conn.from} -.->|"${conn.label}"| ${conn.to}`).join('\n  ')}
        `
      case 'adt':
        return `
          graph TB
            ${viz.elements.map(el => `${el.id}["${el.label}"]`).join('\n  ')}
            ${viz.connections.map(conn => `${conn.from} ==>|"${conn.label}"| ${conn.to}`).join('\n  ')}
        `
      case 'monad':
        return `
          graph LR
            ${viz.elements.map(el => `${el.id}(("${el.label}"))`).join('\n  ')}
            ${viz.connections.map(conn => `${conn.from} -->|"${conn.label}"| ${conn.to}`).join('\n  ')}
        `
      case 'functor':
        return `
          graph LR
            ${viz.elements.map(el => `${el.id}[["${el.label}"]]`).join('\n  ')}
            ${viz.connections.map(conn => `${conn.from} ==>|"${conn.label}"| ${conn.to}`).join('\n  ')}
        `
      default:
        return ''
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">{section.title}</h3>
        <p className="text-gray-600 mb-6">{section.content}</p>
        
        <div className="bg-gray-900 p-4 rounded-lg mb-6">
          <pre className="text-white font-mono text-sm">
            {section.codeExample}
          </pre>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <p className="text-gray-800">{section.explanation}</p>
        </div>

        {section.visualizations?.map((viz, index) => (
          <div key={index} className="border rounded-lg p-4">
            <h4 className="font-medium mb-2">{viz.description}</h4>
            <div className="relative min-h-[300px] max-h-[500px] bg-white overflow-auto">
              <div className="absolute inset-0 flex items-center justify-center">
                <Mermaid
                  chart={getMermaidChart(viz)}
                  config={{
                    theme: 'neutral',
                    flowchart: {
                      curve: 'basis',
                      nodeSpacing: 50,
                      rankSpacing: 50,
                      padding: 10
                    }
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 