'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            编程学习助手
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            基于 VARK 学习模型的多维度学习平台
          </p>
          <p className="text-md text-gray-500">
            视觉(Visual) · 听觉(Aural) · 读写(Read/Write) · 动觉(Kinesthetic)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Visual - 视觉学习 */}
          <Link href="/visual" className="transform hover:scale-105 transition-transform duration-200">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-3xl mb-4">🎨</div>
              <h2 className="text-2xl font-semibold mb-2">可视化学习</h2>
              <p className="text-gray-600">
                通过流程图、思维导图和动画来理解Python代码的执行过程
              </p>
            </div>
          </Link>

          {/* Aural - 听觉学习 */}
          <Link href="/audio" className="transform hover:scale-105 transition-transform duration-200">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-3xl mb-4">🎧</div>
              <h2 className="text-2xl font-semibold mb-2">语音教学</h2>
              <p className="text-gray-600">
                通过AI语音讲解、代码朗读和交互式对话学习编程概念
              </p>
            </div>
          </Link>

          {/* Read/Write - 读写学习 */}
          <Link href="/read-write" className="transform hover:scale-105 transition-transform duration-200">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-3xl mb-4">📚</div>
              <h2 className="text-2xl font-semibold mb-2">读写练习</h2>
              <p className="text-gray-600">
                通过文档阅读、代码注释和编程练习掌握知识要点
              </p>
            </div>
          </Link>

          {/* Kinesthetic - 动觉学习 */}
          <Link href="/practice" className="transform hover:scale-105 transition-transform duration-200">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-3xl mb-4">⌨️</div>
              <h2 className="text-2xl font-semibold mb-2">实践学习</h2>
              <p className="text-gray-600">
                通过交互式编程、项目实战和即时反馈巩固学习成果
              </p>
            </div>
          </Link>
        </div>

        {/* AI 助手部分 */}
        <div className="mt-12">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-center gap-4">
              <div className="text-3xl">🤖</div>
              <h2 className="text-2xl font-semibold">AI 学习助手</h2>
            </div>
            <p className="text-center text-gray-600 mt-2">
              贯穿所有学习模式的智能辅导系统，为你提供个性化的学习建议和解答
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="font-medium">视觉分析</p>
                <p className="text-sm text-gray-600">代码可视化解析</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="font-medium">语音对话</p>
                <p className="text-sm text-gray-600">智能语音交互</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="font-medium">文本指导</p>
                <p className="text-sm text-gray-600">个性化学习建议</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="font-medium">实践辅导</p>
                <p className="text-sm text-gray-600">编程过程指导</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

