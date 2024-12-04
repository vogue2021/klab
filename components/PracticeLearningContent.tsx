'use client'

import { useState, useEffect } from 'react'
import { X, Play, Loader2 } from 'lucide-react'
import Editor from '@monaco-editor/react'

interface PracticeLearningContentProps {
  topic: string
  onClose: () => void
}

interface Content {
  title: string
  introduction: string
  sections: Section[]
}

interface Section {
  title: string
  content: string
  codeExample: string
  explanation: string
}

export default function PracticeLearningContent({ topic, onClose }: PracticeLearningContentProps) {
  const [content, setContent] = useState<Content | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)

  const runCode = async () => {
    if (isRunning) return
    setIsRunning(true)
    setOutput('')

    try {
      const response = await fetch('/api/run-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      })

      if (!response.ok) {
        throw new Error('Failed to execute code')
      }

      const data = await response.json()
      setOutput(data.output || 'Code executed successfully with no output')
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsRunning(false)
    }
  }

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/practice-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic })
        })

        if (!response.ok) {
          throw new Error('コンテンツの取得に失敗しました')
        }

        const data = await response.json()
        setContent(data)
        if (data.sections?.[0]?.codeExample) {
          setCode(data.sections[0].codeExample)
        }
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
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
        <div className="absolute inset-y-0 right-0 w-2/3 bg-white shadow-lg">
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
        <div className="absolute inset-y-0 right-0 w-2/3 bg-white shadow-lg p-6">
          <div className="text-red-500 text-center">
            <p>{error}</p>
            <button 
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              閉じる
            </button>
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
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800">{content.introduction}</p>
              </div>

              {content.sections.map((section, index) => (
                <div key={index} className="space-y-4 border-t pt-8 first:border-t-0 first:pt-0">
                  <h3 className="text-lg font-semibold text-gray-800">{section.title}</h3>
                  <p className="text-gray-600">{section.content}</p>
                  
                  <div className="space-y-4">
                    <Editor
                      height="200px"
                      defaultLanguage="haskell"
                      theme="vs-dark"
                      value={code}
                      onChange={(value) => setCode(value || '')}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: 'on',
                        wordWrap: 'on',
                        readOnly: isRunning,
                        language: 'haskell',
                        automaticLayout: true
                      }}
                    />

                    <div className="bg-gray-100 px-4 py-2 flex justify-between items-center">
                      <button
                        onClick={runCode}
                        disabled={isRunning}
                        className="flex items-center gap-2 px-3 py-1.5 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isRunning ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            実行中...
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4" />
                            コードを実行
                          </>
                        )}
                      </button>
                    </div>

                    {output && (
                      <div className="bg-gray-900 text-white p-4 font-mono text-sm">
                        <pre className="whitespace-pre-wrap">{output}</pre>
                      </div>
                    )}

                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <p className="text-gray-800">{section.explanation}</p>
                    </div>
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