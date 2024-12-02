'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface ReadWriteLearningContentProps {
  topic: string
  onClose: () => void
}

interface CodeLine {
  code: string
  explanation: string
}

interface Section {
  title: string
  content: string
  codeExample: CodeLine[]
  summary: string
}

interface Content {
  title: string
  introduction: string
  concepts: string[]
  relatedTopics: {
    topic: string
    explanation: string
  }[]
  sections: Section[]
}

export default function ReadWriteLearningContent({ topic, onClose }: ReadWriteLearningContentProps) {
  const [content, setContent] = useState<Content | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedLine, setSelectedLine] = useState<{section: number, line: number} | null>(null)

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/read-write-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic })
        })

        if (!response.ok) {
          throw new Error('コンテンツの取得に失敗しました')
        }

        const data = await response.json()
        setContent(data)
      } catch (err) {
        console.error('コンテンツの読み込みに失敗しました:', err)
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
              {/* 概念説明 */}
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">概念理解</h3>
                <p className="text-blue-800 mb-4">{content.introduction}</p>
                <div className="space-y-2">
                  {content.concepts.map((concept, index) => (
                    <p key={index} className="text-blue-700">• {concept}</p>
                  ))}
                </div>
              </div>

              {/* 関連知識 */}
              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-900 mb-4">関連知識</h3>
                <div className="grid gap-4">
                  {content.relatedTopics.map((topic, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                      <h4 className="font-semibold text-purple-800 mb-2">{topic.topic}</h4>
                      <p className="text-purple-700">{topic.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* コード例と解説 */}
              {content.sections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">{section.title}</h3>
                  <p className="text-gray-600">{section.content}</p>
                  
                  <div className="relative bg-gray-900 rounded-lg overflow-hidden">
                    <div className="p-4 space-y-0">
                      {section.codeExample.map((line, lineIndex) => (
                        <div 
                          key={lineIndex}
                          className={`font-mono text-sm border-l-2 ${
                            selectedLine?.section === sectionIndex && 
                            selectedLine?.line === lineIndex
                              ? 'bg-blue-500 bg-opacity-20 border-blue-500'
                              : 'border-transparent hover:border-blue-500 hover:bg-white hover:bg-opacity-5'
                          }`}
                        >
                          <div className="flex items-start">
                            <span className="text-gray-500 w-12 text-right px-2 py-2 select-none flex-shrink-0">
                              {lineIndex + 1}
                            </span>
                            <button
                              className="flex-grow text-left px-4 py-2 w-full"
                              onClick={() => setSelectedLine({ section: sectionIndex, line: lineIndex })}
                            >
                              <code className="text-white whitespace-pre">{line.code}</code>
                            </button>
                          </div>

                          {selectedLine?.section === sectionIndex && 
                           selectedLine?.line === lineIndex && (
                            <div className="bg-gray-800 pl-16 pr-4 py-3 text-gray-300 border-l-2 border-blue-500">
                              <p className="text-sm">{line.explanation}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-gray-800">{section.summary}</p>
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