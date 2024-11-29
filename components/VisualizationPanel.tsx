'use client'

import { useState, useEffect } from 'react'
import FlowchartVisualization from './FlowchartVisualization'
import MindMap from './MindMap'
import CodeAnimation from './CodeAnimation'

interface VisualizationPanelProps {
  code: string
  tool: 'flowchart' | 'mindmap' | 'animation'
}

export default function VisualizationPanel({ code, tool }: VisualizationPanelProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="h-full w-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          {tool === 'flowchart' && '流程图可视化'}
          {tool === 'mindmap' && '思维导图'}
          {tool === 'animation' && '代码动画'}
        </h2>
      </div>
      <div className="flex-1 min-h-0 bg-white rounded-lg shadow-sm overflow-hidden">
        {tool === 'flowchart' && (
          <div className="h-full w-full">
            <FlowchartVisualization code={code} />
          </div>
        )}
        {tool === 'mindmap' && (
          <div className="h-full w-full">
            <MindMap code={code} />
          </div>
        )}
        {tool === 'animation' && (
          <div className="h-full w-full">
            <CodeAnimation code={code} />
          </div>
        )}
      </div>
    </div>
  )
} 