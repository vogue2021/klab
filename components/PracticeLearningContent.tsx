'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface PracticeLearningContentProps {
  topic: string
  onClose: () => void
}

interface Section {
  title: string
  content: string
  codeExample: string
  explanation: string
}

interface Content {
  title: string
  introduction: string
  sections: Section[]
}

export default function PracticeLearningContent({ topic, onClose }: PracticeLearningContentProps) {
  const [content, setContent] = useState<Content | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchContent = async () => {
      try {
        // 这里调用 API 获取内容
        const response = await fetch('/api/practice-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic })
        })

        if (!response.ok) {
          throw new Error('获取内容失败')
        }

        const data = await response.json()
        setContent(data)
      } catch (err) {
        console.error('加载内容失败:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [topic])

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
        <div className="absolute inset-y-0 right-0 w-2/3 bg-white shadow-lg">
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="absolute inset-y-0 right-0 w-2/3 bg-white shadow-lg overflow-auto">
        <div className="sticky top-0 bg-white border-b z-10">
          <div className="p-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold">{content?.title}</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {content && (
            <div className="space-y-8">
              {/* 简短概念说明 */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800">{content.introduction}</p>
              </div>

              {/* 代码示例和讲解 */}
              {content.sections.map((section, index) => (
                <div key={index} className="space-y-4">
                  <h3 className="text-lg font-semibold">{section.title}</h3>
                  <p className="text-gray-600">{section.content}</p>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <pre className="text-sm font-mono overflow-x-auto">
                      <code>{section.codeExample}</code>
                    </pre>
                  </div>
                  
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-gray-800">{section.explanation}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 