'use client'

import { useState } from 'react'
import { Code, GitGraph, Play } from 'lucide-react'
import clsx from 'clsx'

interface NavigationProps {
  activeTool: string
  onToolChange: (tool: string) => void
}

export default function Navigation({ activeTool, onToolChange }: NavigationProps) {
  const tools = [
    {
      id: 'flowchart',
      name: 'フローチャート',
      icon: GitGraph,
      description: 'コードをフローチャートに変換'
    },
    {
      id: 'mindmap',
      name: 'マインドマップ',
      icon: Code,
      description: 'コードから知識ポイントを抽出'
    },
    {
      id: 'animation',
      name: 'コードアニメーション',
      icon: Play,
      description: 'コードの実行プロセスをアニメーションで表示'
    }
  ]

  return (
    <div className="h-full p-4">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">学習ナビ</h2>
      <div className="space-y-2">
        {tools.map((tool) => {
          const Icon = tool.icon
          return (
            <button
              key={tool.id}
              onClick={() => onToolChange(tool.id)}
              className={clsx(
                'w-full p-3 rounded-lg text-left transition-colors duration-200',
                'hover:bg-indigo-50 hover:text-indigo-600',
                'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50',
                {
                  'bg-indigo-50 text-indigo-600': activeTool === tool.id,
                  'text-gray-600': activeTool !== tool.id
                }
              )}
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-5 h-5" />
                <div>
                  <div className="font-medium">{tool.name}</div>
                  <div className="text-sm text-gray-500">{tool.description}</div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
} 