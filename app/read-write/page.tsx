'use client'

import { useState } from 'react'
import { ArrowLeft, RefreshCw } from 'lucide-react'
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

export default function ReadWritePlatform() {
  const router = useRouter()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [showLearningContent, setShowLearningContent] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

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
    setQuizzes([])
  }

  const handleTopicChange = async (topic: string) => {
    setSelectedTopic(topic)
    await generateQuizzes(topic)
  }

  const generateQuizzes = async (topic: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/generate-quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      })
      
      if (!response.ok) {
        throw new Error('Failed to generate quizzes')
      }

      const data = await response.json()
      setQuizzes(data.quizzes)
    } catch (error) {
      console.error('Error generating quizzes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = () => {
    if (selectedTopic) {
      generateQuizzes(selectedTopic)
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
                    <h2 className="text-xl font-semibold">
                      {selectedTopic ? `${selectedTopic}練習` : '練習問題'}
                    </h2>
                    {selectedTopic && (
                      <button
                        onClick={handleRefresh}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                      >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        再生成
                      </button>
                    )}
                  </div>

                  {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                    </div>
                  ) : quizzes.length > 0 ? (
                    <div className="space-y-8">
                      {quizzes.map((quiz, index) => (
                        <QuizSection
                          key={index}
                          quiz={quiz}
                          index={index + 1}
                        />
                      ))}
                    </div>
                  ) : selectedTopic ? (
                    <div className="text-center text-gray-500 py-12">
                      練習問題を準備中...
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-12">
                      トピックを選択して練習を始めてください
                    </div>
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