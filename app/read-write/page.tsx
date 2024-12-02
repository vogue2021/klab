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
    category: "Pythonの基礎",
    items: [
      "変数とデータ型",
      "条件文",
      "ループ文",
      "関数",
      "リストとタプル",
      "辞書とセット"
    ]
  },
  {
    category: "上級概念",
    items: [
      "クラスとオブジェクト",
      "ファイル操作",
      "例外処理",
      "モジュールとパッケージ"
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
          <h1 className="text-2xl font-bold">Python読み書き学習プラットフォーム</h1>
        </div>
        
        <div className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-12 gap-6">
              {/* 選択エリア */}
              <div className="col-span-4 bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">学習内容を選択</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      カテゴリー
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="w-full border rounded-md p-2"
                    >
                      <option value="">カテゴリーを選択してください</option>
                      {TOPICS.map(topic => (
                        <option key={topic.category} value={topic.category}>
                          {topic.category}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {selectedCategory && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        トピック
                      </label>
                      <select
                        value={selectedTopic}
                        onChange={(e) => handleTopicChange(e.target.value)}
                        className="w-full border rounded-md p-2"
                      >
                        <option value="">トピックを選択してください</option>
                        {TOPICS.find(t => t.category === selectedCategory)?.items.map(item => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* 練習エリア */}
              <div className="col-span-8">
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
          </div>
        </div>
      </div>

      {showLearningContent && (
        <ReadWriteLearningContent 
          topic={selectedTopic}
          onClose={() => setShowLearningContent(false)}
        />
      )}
    </div>
  )
} 