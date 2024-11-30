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
          <p className="text-xl text-gray-600">
            通过可视化和交互式学习，掌握编程概念
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Link href="/visual" className="transform hover:scale-105 transition-transform duration-200">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-3xl mb-4">🎨</div>
              <h2 className="text-2xl font-semibold mb-2">可视化学习</h2>
              <p className="text-gray-600">
                通过流程图、思维导图和动画来理解Python代码的执行过程
              </p>
            </div>
          </Link>

          <div className="bg-white rounded-lg shadow-lg p-6 opacity-50">
            <div className="text-3xl mb-4">📚</div>
            <h2 className="text-2xl font-semibold mb-2">交互式教程</h2>
            <p className="text-gray-600">
              即将推出 - 步骤式学习指导和实时反馈
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 opacity-50">
            <div className="text-3xl mb-4">🤖</div>
            <h2 className="text-2xl font-semibold mb-2">AI 助手</h2>
            <p className="text-gray-600">
              即将推出 - 智能问答和个性化学习建议
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

