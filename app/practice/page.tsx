'use client'

import { useState } from 'react'
import { ArrowLeft, Loader2, Play } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import CodeEditor from '@/components/CodeEditor'
import ReactMarkdown from 'react-markdown'

interface Content {
  title: string
  introduction: string
  prerequisites: string[]
  sections: Array<{
    title: string
    content: string
    codeExample: string
    explanation: string
  }>
}

interface PracticeQuestion {
  question: string
  initialCode: string
  testCases: Array<{
    input: string
    expectedOutput: string
  }>
  hints: string[]
  solution: {
    code: string
    explanation: string
  }
}

export default function PracticePlatform() {
  const router = useRouter()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState('')
  const [content, setContent] = useState<Content | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isGeneratingPractice, setIsGeneratingPractice] = useState(false)
  const [questions, setQuestions] = useState<PracticeQuestion[]>([])
  const [currentCode, setCurrentCode] = useState<Record<number, string>>({})
  const [showSolution, setShowSolution] = useState<Record<number, boolean>>({})
  const [evaluating, setEvaluating] = useState<Record<number, boolean>>({})
  const [feedback, setFeedback] = useState<Record<number, string>>({})
  const [runningCode, setRunningCode] = useState<Record<number, boolean>>({})
  const [codeResults, setCodeResults] = useState<Record<number, {
    output: string
    feedback: string
  }>>({})

  const handleTopicSelect = async (topic: string) => {
    if (topic !== selectedTopic) {
      setSelectedTopic(topic)
      setLoading(true)
      setError(null)

      try {
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
      } catch (err) {
        console.error('コンテンツの読み込みに失敗:', err)
        setError(err instanceof Error ? err.message : 'コンテンツの読み込みに失敗しました')
      } finally {
        setLoading(false)
      }
    }
  }

  const generatePractice = async () => {
    if (!selectedTopic || isGeneratingPractice) return

    setIsGeneratingPractice(true)
    try {
      const response = await fetch('/api/generate-practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: selectedTopic })
      })

      if (!response.ok) {
        throw new Error('問題の生成に失敗しました')
      }

      const data = await response.json()
      setQuestions(data.questions)
      // 初期コードを設定
      const initialCodes: Record<number, string> = {}
      data.questions.forEach((q: PracticeQuestion, index: number) => {
        initialCodes[index] = q.initialCode
      })
      setCurrentCode(initialCodes)
    } catch (err) {
      console.error('問題生成エラー:', err)
      alert(err instanceof Error ? err.message : '問題の生成に失敗しました')
    } finally {
      setIsGeneratingPractice(false)
    }
  }

  const evaluateCode = async (index: number) => {
    if (!currentCode[index]) return

    setEvaluating(prev => ({ ...prev, [index]: true }))
    try {
      const response = await fetch('/api/evaluate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: currentCode[index],
          testCases: questions[index].testCases
        })
      })

      if (!response.ok) {
        throw new Error('コードの評価に失敗しました')
      }

      const data = await response.json()
      setFeedback(prev => ({ ...prev, [index]: data.feedback }))
    } catch (err) {
      console.error('評価エラー:', err)
      setFeedback(prev => ({
        ...prev,
        [index]: err instanceof Error ? err.message : 'コードの評価に失敗しました'
      }))
    } finally {
      setEvaluating(prev => ({ ...prev, [index]: false }))
    }
  }

  const runCode = async (index: number) => {
    if (!currentCode[index] || runningCode[index]) return

    setRunningCode(prev => ({ ...prev, [index]: true }))
    try {
      const response = await fetch('/api/evaluate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: currentCode[index],
          expectedCode: questions[index].solution.code,
          topic: selectedTopic
        })
      })

      if (!response.ok) {
        throw new Error('コードの実行に失敗しました')
      }

      const data = await response.json()
      setCodeResults(prev => ({
        ...prev,
        [index]: {
          output: data.output || 'No output',
          feedback: data.feedback
        }
      }))
    } catch (err) {
      console.error('実行エラー:', err)
      setCodeResults(prev => ({
        ...prev,
        [index]: {
          output: 'Error',
          feedback: err instanceof Error ? err.message : 'コードの実行に失敗しました'
        }
      }))
    } finally {
      setRunningCode(prev => ({ ...prev, [index]: false }))
    }
  }

  const handleBack = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar 
        onTopicSelect={handleTopicSelect}
        isCollapsed={isSidebarCollapsed}
        onCollapsedChange={setIsSidebarCollapsed}
      />

      <div className={`transition-all duration-300 ${
        isSidebarCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        <div className="p-4 border-b bg-white flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="ホームページに戻る"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold">Haskellプログラミング練習プラットフォーム</h1>
        </div>

        <div className="container mx-auto p-4">
          <div className="grid grid-cols-2 gap-6">
            {/* 左側：練習問題エリア */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">プログラミング練習</h2>
                  <button
                    onClick={generatePractice}
                    disabled={isGeneratingPractice || !selectedTopic}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isGeneratingPractice ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        生成中...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        問題を生成
                      </>
                    )}
                  </button>
                </div>

                {questions.length > 0 && (
                  <div className="space-y-8">
                    {questions.map((question, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h3 className="font-medium text-lg mb-2">問題 {index + 1}</h3>
                        <p className="text-gray-700 mb-4">{question.question}</p>

                        <div className="mb-4">
                          <h4 className="font-medium text-blue-800 mb-2">テストケース:</h4>
                          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                            {question.testCases.map((test, idx) => (
                              <div key={idx} className="flex gap-4">
                                <span className="text-gray-600">入力: {test.input}</span>
                                <span className="text-gray-600">期待出力: {test.expectedOutput}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="relative">
                            <div className="border rounded-lg overflow-hidden">
                              <div className="bg-gray-800 px-4 py-2 flex justify-between items-center">
                                <span className="text-white font-medium">コードエディタ</span>
                                <button
                                  onClick={() => runCode(index)}
                                  disabled={runningCode[index]}
                                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 flex items-center gap-2 text-sm"
                                >
                                  {runningCode[index] ? (
                                    <>
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                      実行中...
                                    </>
                                  ) : (
                                    <>
                                      <Play className="w-4 h-4" />
                                      実行
                                    </>
                                  )}
                                </button>
                              </div>
                              <div className="relative">
                                <CodeEditor
                                  value={currentCode[index] || question.initialCode}
                                  onChange={(value) => setCurrentCode(prev => ({ ...prev, [index]: value }))}
                                  language="haskell"
                                  height="200px"
                                  theme="vs-dark"
                                  options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    lineNumbers: 'on',
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                    tabSize: 2,
                                  }}
                                />
                              </div>
                            </div>
                          </div>

                          {codeResults[index] && (
                            <div className="mt-4 space-y-4">
                              <div className="bg-gray-800 p-4 rounded-lg">
                                <h4 className="font-medium text-white mb-2">実行結果:</h4>
                                <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap">
                                  {codeResults[index].output}
                                </pre>
                              </div>
                              <div className="bg-blue-50 p-4 rounded-lg">
                                <h4 className="font-medium text-blue-800 mb-2">AIから��フィードバック:</h4>
                                <p className="text-blue-700 whitespace-pre-wrap">{codeResults[index].feedback}</p>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex justify-between items-center mb-4">
                          <button
                            onClick={() => evaluateCode(index)}
                            disabled={evaluating[index]}
                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 flex items-center gap-2"
                          >
                            {evaluating[index] ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                評価中...
                              </>
                            ) : (
                              'コードを評価'
                            )}
                          </button>

                          <button
                            onClick={() => setShowSolution(prev => ({ ...prev, [index]: !prev[index] }))}
                            className="px-4 py-2 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                          >
                            {showSolution[index] ? '解答を隠す' : '解答を見る'}
                          </button>
                        </div>

                        {feedback[index] && (
                          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-medium text-blue-800 mb-2">フィードバック:</h4>
                            <p className="text-blue-700">{feedback[index]}</p>
                          </div>
                        )}

                        {showSolution[index] && (
                          <div className="mt-4">
                            <h4 className="font-medium text-green-800 mb-2">解答例:</h4>
                            <div className="bg-gray-900 p-4 rounded-lg mb-2">
                              <pre className="text-white font-mono text-sm">
                                {question.solution.code}
                              </pre>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg">
                              <h4 className="font-medium text-green-800 mb-2">解説:</h4>
                              <p className="text-green-700">{question.solution.explanation}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 右側：学習コンテンツエリア */}
            <div className="bg-white p-6 rounded-lg shadow-lg overflow-auto max-h-[calc(100vh-12rem)]">
              <h2 className="text-xl font-semibold mb-4">学習コンテンツ</h2>
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              ) : error ? (
                <div className="text-red-500 text-center py-8">
                  <p>{error}</p>
                </div>
              ) : content ? (
                <div className="space-y-8">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">{content.title}</h3>
                    <ReactMarkdown className="text-blue-700 prose">
                      {content.introduction}
                    </ReactMarkdown>
                    {content.prerequisites.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium text-blue-800 mb-2">前提知識：</h4>
                        <ul className="list-disc list-inside text-blue-700">
                          {content.prerequisites.map((prereq, index) => (
                            <li key={index}>
                              <ReactMarkdown className="inline">{prereq}</ReactMarkdown>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {content.sections.map((section, index) => (
                    <div key={index} className="border-t pt-6 first:border-t-0 first:pt-0">
                      <h4 className="text-lg font-semibold mb-3">{section.title}</h4>
                      <ReactMarkdown className="text-gray-600 mb-4 prose">
                        {section.content}
                      </ReactMarkdown>
                      
                      <div className="bg-gray-900 p-4 rounded-lg mb-4">
                        <pre className="text-white font-mono text-sm">
                          {section.codeExample}
                        </pre>
                      </div>
                      
                      <ReactMarkdown className="text-gray-800 prose">
                        {section.explanation}
                      </ReactMarkdown>

                      {section.commonMistakes && section.commonMistakes.length > 0 && (
                        <div className="mt-4 bg-red-50 p-4 rounded-lg">
                          <h5 className="font-medium text-red-800 mb-2">よくある間違い：</h5>
                          <ul className="list-disc list-inside text-red-700">
                            {section.commonMistakes.map((mistake, idx) => (
                              <li key={idx}>
                                <ReactMarkdown className="inline">{mistake}</ReactMarkdown>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {section.tips && section.tips.length > 0 && (
                        <div className="mt-4 bg-green-50 p-4 rounded-lg">
                          <h5 className="font-medium text-green-800 mb-2">実践的なヒント：</h5>
                          <ul className="list-disc list-inside text-green-700">
                            {section.tips.map((tip, idx) => (
                              <li key={idx}>
                                <ReactMarkdown className="inline">{tip}</ReactMarkdown>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}

                  {content.keyPoints && content.keyPoints.length > 0 && (
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="font-medium text-yellow-800 mb-2">重要ポイント：</h4>
                      <ul className="list-disc list-inside text-yellow-700">
                        {content.keyPoints.map((point, index) => (
                          <li key={index}>
                            <ReactMarkdown className="inline">{point}</ReactMarkdown>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {content.realWorldExamples && content.realWorldExamples.length > 0 && (
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-medium text-purple-800 mb-2">実際の使用例：</h4>
                      <ul className="list-disc list-inside text-purple-700">
                        {content.realWorldExamples.map((example, index) => (
                          <li key={index}>
                            <ReactMarkdown className="inline">{example}</ReactMarkdown>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {content.furtherResources && content.furtherResources.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-800 mb-2">追加の学習リソース：</h4>
                      <ul className="list-disc list-inside text-gray-700">
                        {content.furtherResources.map((resource, index) => (
                          <li key={index}>
                            <ReactMarkdown className="inline">{resource}</ReactMarkdown>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  左のサイドバーからトピックを選択してください
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 