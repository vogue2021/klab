'use client'

import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import AudioContent from '@/components/AudioContent'

export default function AudioLearning() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [showLearningContent, setShowLearningContent] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState('')

  const handleTopicSelect = (topic: string) => {
    setSelectedTopic(topic)
    setShowLearningContent(true)
  }

  return (
    <div className="flex h-screen">
      {/* 左侧菜单 */}
      <Sidebar 
        onTopicSelect={handleTopicSelect}
        isCollapsed={isSidebarCollapsed}
        onCollapsedChange={setIsSidebarCollapsed}
      />

      {/* 主要内容区域 */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        isSidebarCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        {/* 顶部标题栏 */}
        <div className="p-4 border-b bg-white">
          <h1 className="text-2xl font-bold">Python语音教学平台</h1>
        </div>
        
        {/* 主要内容区域 */}
        <div className="flex-1 flex min-h-0">
          {/* 临时占位内容 */}
          <div className="flex-1 p-8">
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="text-6xl mb-4">🎧</div>
                <p className="text-xl">听觉学习模块开发中...</p>
                <p className="mt-2 text-gray-400">
                  即将推出：AI语音讲解、代码朗读、交互式对话等功能
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 学习内容覆盖层 */}
      {showLearningContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="absolute inset-y-0 right-0 w-2/3 bg-white shadow-lg">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">{selectedTopic}</h2>
              <button 
                onClick={() => setShowLearningContent(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                关闭
              </button>
            </div>
            <AudioContent 
              topic={selectedTopic}
              onClose={() => setShowLearningContent(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
} 