'use client'

import { useState } from 'react'
import { ArrowLeft, RefreshCw, Loader2, Play } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import ReadWriteLearningContent from '@/components/ReadWriteLearningContent'
import QuizSection from '@/components/QuizSection'

// 学習トピックを定義する
const TOPICS = [
  {
    category: "Haskellの基礎",
    items: [
      "関数と型",
      "リストと再帰",
      "パターンマッチング",
      "高階関数",
      "型クラス",
      "モナド入門"
    ]
  },
  {
    category: "上級概念",
    items: [
      "型システム",
      "IOモナド",
      "アプリカティブファンクター",
      "モナド変換子"
    ]
  }
]

interface Quiz {
  type: 'choice' | 'code'
  question: string
  options?: string[]
  code?: string
  answer: string | number
  explanation: string
}

export default function ReadWritePlatform() {
  const router = useRouter()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [showLearningContent, setShowLearningContent] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [questions, setQuestions] = useState<Quiz[]>([])
  const [isGeneratingPractice, setIsGeneratingPractice] = useState(false)
  const [mcqCount, setMcqCount] = useState(2)
  const [fillInBlankCount, setFillInBlankCount] = useState(1)

  const handleTopicSelect = (topic: string) => {
    setSelectedTopic(topic)
    setShowLearningContent(true)
  }

  const handleBack = () => {
    router.push('/')
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setSelectedTopic('')
    setQuestions([])
  }

  const handleTopicChange = async (topic: string) => {
    setSelectedTopic(topic)
    await generatePractice()
  }

  const generatePractice = async () => {
    if (!selectedTopic || isGeneratingPractice) return

    setIsGeneratingPractice(true)
    try {
      const response = await fetch('/api/generate-quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          topic: selectedTopic,
          questionTypes: {
            choice: mcqCount,
            code: fillInBlankCount
          }
        })
      })

      if (!response.ok) {
        throw new Error('問題の生成に失敗しました')
      }

      const data = await response.json()
      setQuestions(data.quizzes)
    } catch (err) {
      console.error('問題生成エラー:', err)
      alert(err instanceof Error ? err.message : '問題の生成に失敗しました')
    } finally {
      setIsGeneratingPractice(false)
    }
  }

  const handleRefresh = () => {
    if (selectedTopic) {
      generatePractice()
    }
  }

  return (
    <div className="flex h-screen">
      <Sidebar 
        onTopicSelect={handleTopicSelect}
        isCollapsed={isSidebarCollapsed}
        onCollapsedChange={setIsSidebarCollapsed}
      />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        isSidebarCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        <div className="p-4 border-b bg-white flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="ホームに戻る"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold">Haskell読み書き学習プラットフォーム</h1>
        </div>
        
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 gap-6">
              {/* 左側：練習問題エリア */}
              <div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">練習問題</h2>
                    {selectedTopic && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={generatePractice}
                          disabled={isGeneratingPractice}
                          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 flex items-center gap-2"
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
                        <button
                          onClick={handleRefresh}
                          disabled={isGeneratingPractice}
                          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
                        >
                          <RefreshCw className={`w-4 h-4 ${isGeneratingPractice ? 'animate-spin' : ''}`} />
                          再生成
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 問題生成設定 */}
                  <div className="mb-6">
                    <h3 className="font-medium mb-2">問題設定</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          選択問題の数
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="5"
                          className="w-full px-3 py-2 border rounded-md"
                          value={mcqCount}
                          onChange={(e) => setMcqCount(parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          空欄補充問題の数
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="3"
                          className="w-full px-3 py-2 border rounded-md"
                          value={fillInBlankCount}
                          onChange={(e) => setFillInBlankCount(parseInt(e.target.value) || 1)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 問題一覧 */}
                  {questions.length > 0 ? (
                    <div className="space-y-8">
                      {questions.map((quiz, index) => (
                        <QuizSection
                          key={index}
                          quiz={quiz}
                          index={index + 1}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      「問題を生成」ボタンをクリックして問題を生成してください
                    </p>
                  )}
                </div>
              </div>

              {/* 右側：学習コンテンツエリア */}
              <div>
                <div className="bg-white p-6 rounded-lg shadow">
                  {selectedTopic ? (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold">{selectedTopic}の学習内容</h2>
                      {/* ReadWriteLearningContent の内容をここに直接表示 */}
                      <div className="prose max-w-none">
                        {/* 学習コンテンツの内容をここに表示 */}
                        <ReadWriteLearningContent 
                          topic={selectedTopic}
                          isModal={false}  // モーダル表示を無効化
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-12">
                      トピックを選択して学習を始めてください
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 