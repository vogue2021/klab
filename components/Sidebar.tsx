'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface SidebarProps {
  onTopicSelect: (topic: string) => void
  isCollapsed: boolean
  onCollapsedChange: (collapsed: boolean) => void
}

export default function Sidebar({ 
  onTopicSelect, 
  isCollapsed, 
  onCollapsedChange 
}: SidebarProps) {
  const [selectedTopic, setSelectedTopic] = useState<string>('')

  const topics = [
    '変数とデータ型',
    '条件文',
    'ループ構造',
    '関数の基礎',
    '配列操作'
  ]

  const handleTopicClick = (topic: string) => {
    setSelectedTopic(topic)
    onTopicSelect(topic)
  }

  return (
    <div className={`fixed top-0 left-0 bg-white border-r border-gray-200 
                    shadow-lg h-screen transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <button
        onClick={() => onCollapsedChange(!isCollapsed)}
        className="absolute -right-3 top-6 bg-white rounded-full p-1.5 
                   border border-gray-200 shadow-md hover:bg-gray-50 z-10"
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-gray-600" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        )}
      </button>

      <div className="flex flex-col h-full">
        <div className={`p-6 border-b border-gray-200 bg-gray-50 ${
          isCollapsed ? 'opacity-0' : 'opacity-100'
        } transition-opacity duration-300`}>
          <h2 className="text-xl font-bold text-gray-800">
            学習トピック
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <ul className="space-y-2">
              {topics.map((topic) => (
                <li key={topic}>
                  <button
                    className={`w-full text-left rounded-lg transition-all duration-200 
                               ${selectedTopic === topic 
                                 ? 'bg-blue-500 text-white shadow-sm' 
                                 : 'text-gray-700 hover:bg-gray-100'
                               } ${isCollapsed 
                                 ? 'p-2 overflow-hidden whitespace-nowrap' 
                                 : 'px-4 py-2'}`}
                    onClick={() => handleTopicClick(topic)}
                    title={isCollapsed ? topic : ''}
                  >
                    <span className={`transition-all duration-200 ${
                      isCollapsed ? 'text-lg font-medium' : ''
                    }`}>
                      {isCollapsed ? topic.charAt(0) : topic}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 