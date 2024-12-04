'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'

interface Exercise {
  question: string
  hints: string[]
  solution: string
}

interface Section {
  title: string
  content: string
  codeExample: string
  explanation: string
  commonMistakes: string[]
  tips: string[]
}

interface AudioContentData {
  title: string
  introduction: string
  prerequisites: string[]
  sections: Section[]
  keyPoints: string[]
  exercises: Exercise[]
  realWorldExamples: string[]
  furtherResources: string[]
}

interface Props {
  topic: string
  onClose: () => void
}

export default function AudioContent({ topic, onClose }: Props) {
  const [content, setContent] = useState<AudioContentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/analyze-audio', {
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
        console.error('コンテンツの読み込みに失敗:', err)
        setError(err instanceof Error ? err.message : 'コンテンツの読み込みに失敗しました')
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [topic])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-8">
        <p>{error}</p>
      </div>
    )
  }

  if (!content) {
    return (
      <div className="text-gray-500 text-center py-8">
        コンテンツが見つかりません
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* 導入部分 */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800">{content.title}</h3>
        <p className="text-gray-600">{content.introduction}</p>
        
        {/* 前提知識 */}
        {content.prerequisites.length > 0 && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">前提知識：</h4>
            <ul className="list-disc list-inside space-y-1">
              {content.prerequisites.map((item, index) => (
                <li key={index} className="text-blue-700">{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* セクション */}
      {content.sections.map((section, index) => (
        <div key={index} className="border-t pt-6 first:border-t-0 first:pt-0">
          <h4 className="text-lg font-semibold mb-3">{section.title}</h4>
          <p className="text-gray-600 mb-4">{section.content}</p>
          
          {/* コード例 */}
          <div className="bg-gray-800 text-white p-4 rounded-lg mb-4 font-mono">
            <pre>{section.codeExample}</pre>
          </div>
          
          <p className="text-gray-700 mb-4">{section.explanation}</p>

          {/* よくある間違い */}
          <div className="bg-red-50 p-4 rounded-lg mb-4">
            <h5 className="font-semibold text-red-800 mb-2">よくある間違い：</h5>
            <ul className="list-disc list-inside space-y-1">
              {section.commonMistakes.map((mistake, i) => (
                <li key={i} className="text-red-700">{mistake}</li>
              ))}
            </ul>
          </div>

          {/* ヒント */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h5 className="font-semibold text-green-800 mb-2">ヒント：</h5>
            <ul className="list-disc list-inside space-y-1">
              {section.tips.map((tip, i) => (
                <li key={i} className="text-green-700">{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      ))}

      {/* 練習問題 */}
      {content.exercises.length > 0 && (
        <div className="border-t pt-6">
          <h4 className="text-lg font-semibold mb-4">練習問題</h4>
          <div className="space-y-6">
            {content.exercises.map((exercise, index) => (
              <div key={index} className="bg-yellow-50 p-4 rounded-lg">
                <p className="font-semibold text-yellow-800 mb-2">{exercise.question}</p>
                <div className="space-y-2">
                  <h5 className="font-medium text-yellow-700">ヒント：</h5>
                  <ul className="list-disc list-inside">
                    {exercise.hints.map((hint, i) => (
                      <li key={i} className="text-yellow-700">{hint}</li>
                    ))}
                  </ul>
                  <details className="mt-4">
                    <summary className="cursor-pointer text-yellow-600 hover:text-yellow-700">
                      解答を表示
                    </summary>
                    <div className="mt-2 p-2 bg-yellow-100 rounded">
                      <pre className="text-yellow-800">{exercise.solution}</pre>
                    </div>
                  </details>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 実際の使用例 */}
      {content.realWorldExamples.length > 0 && (
        <div className="border-t pt-6">
          <h4 className="text-lg font-semibold mb-3">実際の使用例</h4>
          <ul className="list-disc list-inside space-y-2">
            {content.realWorldExamples.map((example, index) => (
              <li key={index} className="text-gray-700">{example}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 追加の学習リソース */}
      {content.furtherResources.length > 0 && (
        <div className="border-t pt-6">
          <h4 className="text-lg font-semibold mb-3">追加の学習リソース</h4>
          <ul className="list-disc list-inside space-y-2">
            {content.furtherResources.map((resource, index) => (
              <li key={index} className="text-blue-600 hover:text-blue-800">
                <a href={resource} target="_blank" rel="noopener noreferrer">
                  {resource}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
} 