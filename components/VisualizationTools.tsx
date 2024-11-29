'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GitBranch, GitGraph, Play } from 'lucide-react'

const tools = [
  {
    id: 'flowchart',
    name: '流程图',
    description: '将代码转换为流程图',
    icon: GitGraph
  },
  {
    id: 'mindmap',
    name: '思维导图',
    description: '代码结构思维导图',
    icon: GitBranch
  },
  {
    id: 'animation',
    name: '代码动画',
    description: '代码执行动画演示',
    icon: Play
  }
]

interface VisualizationToolsProps {
  selectedTool: string;
  onSelectTool: (tool: string) => void;
}

export default function VisualizationTools({
  selectedTool,
  onSelectTool
}: VisualizationToolsProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className={cn(
      "relative h-full bg-white border-r transition-all duration-300",
      isCollapsed ? "w-[50px]" : "w-64"
    )}>
      {/* 收缩按钮 */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 z-10 p-1 bg-white border rounded-full shadow-md"
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      {/* 工具内容 */}
      <div className={cn(
        "h-full overflow-hidden transition-all duration-300",
        isCollapsed ? "opacity-0" : "opacity-100"
      )}>
        <div className="py-4">
          <h2 className="px-4 text-lg font-semibold mb-4">可视化工具</h2>
          {!isCollapsed && (
            <div className="space-y-1">
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => onSelectTool(tool.id)}
                  className={cn(
                    "w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors flex items-start gap-3",
                    selectedTool === tool.id && "bg-gray-100"
                  )}
                >
                  <tool.icon className="w-5 h-5 mt-1 shrink-0" />
                  <div>
                    <div className="font-medium">{tool.name}</div>
                    <div className="text-sm text-gray-500">{tool.description}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 