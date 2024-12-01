'use client'

import { useState } from 'react'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import PracticeLearningContent from '@/components/PracticeLearningContent'
import PracticeExercise from '@/components/PracticeExercise'

// 定义学习主题
const TOPICS = [
  {
    category: "Python基础",
    items: [
      "变量和数据类型",
      "条件语句",
      "循环语句",
      "函数",
      "列表和元组",
      "字典和集合"
    ]
  },
  {
    category: "进阶概念",
    items: [
      "类和对象",
      "文件操作",
      "异常处理",
      "模块和包"
    ]
  }
]

export default function PracticePlatform() {
  const router = useRouter()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [showLearningContent, setShowLearningContent] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [exercises, setExercises] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleBack = () => {
    router.push('/')
  }

  const handleTopicSelect = (topic: string) => {
    setSelectedTopic(topic)
    setShowLearningContent(true)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setSelectedTopic('')
    setExercises([])
  }

  const handleTopicChange = async (topic: string) => {
    setSelectedTopic(topic)
    await generateExercises(topic)
  }

  const generateExercises = async (topic: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/generate-exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      })
      
      if (!response.ok) {
        throw new Error('Failed to generate exercises')
      }

      const data = await response.json()
      setExercises(data.exercises)
    } catch (error) {
      console.error('Error generating exercises:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = () => {
    if (selectedTopic) {
      generateExercises(selectedTopic)
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
            title="返回主页"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold">Python实践学习平台</h1>
        </div>
        
        <div className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-12 gap-6">
              {/* 选择区域 */}
              <div className="col-span-4 bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">选择学习内容</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      类别
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="w-full border rounded-md p-2"
                    >
                      <option value="">请选择类别</option>
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
                        主题
                      </label>
                      <select
                        value={selectedTopic}
                        onChange={(e) => handleTopicChange(e.target.value)}
                        className="w-full border rounded-md p-2"
                      >
                        <option value="">请选择主题</option>
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

              {/* 练习区域 */}
              <div className="col-span-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">
                    {selectedTopic ? `${selectedTopic}练习` : '实践练习'}
                  </h2>
                  {selectedTopic && (
                    <button
                      onClick={handleRefresh}
                      disabled={isLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                      重新生成
                    </button>
                  )}
                </div>

                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                  </div>
                ) : exercises.length > 0 ? (
                  <div className="space-y-8">
                    {exercises.map((exercise, index) => (
                      <PracticeExercise
                        key={index}
                        exercise={exercise}
                        index={index + 1}
                      />
                    ))}
                  </div>
                ) : selectedTopic ? (
                  <div className="text-center text-gray-500 py-12">
                    正在准备练习题...
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-12">
                    请选择一个主题开始练习
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showLearningContent && (
        <PracticeLearningContent 
          topic={selectedTopic}
          onClose={() => setShowLearningContent(false)}
        />
      )}
    </div>
  )
} 