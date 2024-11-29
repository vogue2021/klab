'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface LearningContentProps {
  topic: string
  onClose: () => void
}

interface LearningMaterial {
  concept: {
    explanation: string
    svgDiagram: string // SVG 字符串
  }
  examples: {
    code: string
    explanation: string
    output?: string
  }[]
  exercises: {
    question: string
    hints: string[]
    solution?: string
  }[]
}

export default function LearningContent({ topic, onClose }: LearningContentProps) {
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState<LearningMaterial | null>(null)

  useEffect(() => {
    const generateContent = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/generate-learning-content', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ topic }),
        })

        if (!response.ok) {
          throw new Error('生成内容失败')
        }

        const data = await response.json()
        setContent(data)
      } catch (error) {
        console.error('生成学习内容错误:', error)
      } finally {
        setLoading(false)
      }
    }

    generateContent()
  }, [topic])

  if (loading) {
    return (
      <div className="fixed top-0 right-0 bottom-0 left-64 bg-white z-20 
                    flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">正在生成学习内容...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed top-0 right-0 bottom-0 left-64 bg-gray-50 z-20 overflow-auto">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full
                   transition-colors duration-200"
      >
        <X className="w-6 h-6 text-gray-600" />
      </button>

      <div className="max-w-5xl mx-auto p-8">
        {/* 标题区域 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{topic}</h2>
        </div>

        {content && (
          <>
            {/* 概念解析 */}
            <section className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">概念解析</h3>
              <div className="space-y-6">
                {/* SVG 图解 */}
                <div className="border rounded-lg p-4 bg-gray-50" 
                     dangerouslySetInnerHTML={{ __html: content.concept.svgDiagram }} 
                />
                {/* 文字解释 */}
                <div className="prose max-w-none">
                  <p className="text-gray-600 leading-relaxed">
                    {content.concept.explanation}
                  </p>
                </div>
              </div>
            </section>

            {/* 代码示例 */}
            <section className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">代码示例</h3>
              <div className="space-y-6">
                {content.examples.map((example, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <pre className="bg-gray-50 p-4 rounded-lg mb-4">
                      <code>{example.code}</code>
                    </pre>
                    <p className="text-gray-600">{example.explanation}</p>
                    {example.output && (
                      <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">输出:</p>
                        <pre className="mt-2">{example.output}</pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* 练习题目 */}
            <section className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">练习题目</h3>
              <div className="space-y-6">
                {content.exercises.map((exercise, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <p className="font-medium mb-4">{exercise.question}</p>
                    <div className="space-y-2">
                      {exercise.hints.map((hint, hintIndex) => (
                        <p key={hintIndex} className="text-gray-600 text-sm">
                          提示 {hintIndex + 1}: {hint}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  )
} 