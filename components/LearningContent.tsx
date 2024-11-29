'use client'

import { X } from 'lucide-react'

interface LearningContentProps {
  topic: string
  onClose: () => void
}

export default function LearningContent({ topic, onClose }: LearningContentProps) {
  return (
    <div className="fixed top-0 right-0 bottom-0 left-64 bg-white z-20 overflow-auto">
      {/* 关闭按钮 */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full
                   transition-colors duration-200"
        aria-label="关闭"
      >
        <X className="w-6 h-6 text-gray-600" />
      </button>

      {/* 内容区域 */}
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-6">{topic}</h2>
        {/* 这里添加学习内容 */}
      </div>
    </div>
  )
} 