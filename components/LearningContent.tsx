'use client'

import { useState, useEffect } from 'react'
import FlowchartVisualization from './FlowchartVisualization'

interface LearningContentProps {
  topic: string  // 从菜单选择的主题
}

interface ContentItem {
  type: 'text' | 'diagram'
  content: string
  explanation?: string
}

export default function LearningContent({ topic }: LearningContentProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [learningContent, setLearningContent] = useState<ContentItem[]>([])

  useEffect(() => {
    const generateContent = async () => {
      if (!topic) return

      setLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/generate-learning-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic })
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || '生成学习内容失败')
        }

        setLearningContent(data.content)
      } catch (err) {
        console.error('Learning content error:', err)
        setError(err instanceof Error ? err.message : '生成内容失败')
      } finally {
        setLoading(false)
      }
    }

    generateContent()
  }, [topic])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-500 p-8 text-center">
        <p>{error}</p>
        <button 
          onClick={() => setError(null)}
          className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          重试
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-8">{topic}</h1>
      <div className="space-y-12">
        {learningContent.map((item, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden">
            {item.type === 'diagram' && (
              <div className="p-6">
                <FlowchartVisualization code={item.content} />
                {item.explanation && (
                  <p className="mt-4 text-gray-600 text-lg leading-relaxed">
                    {item.explanation}
                  </p>
                )}
              </div>
            )}
            {item.type === 'text' && (
              <div className="p-6">
                <p className="text-gray-700 text-lg leading-relaxed">
                  {item.content}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
} 