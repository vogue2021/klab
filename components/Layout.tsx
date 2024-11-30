'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Layout({
  children,
  sidebar
}: {
  children: React.ReactNode
  sidebar: React.ReactNode
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 侧边栏 */}
      <div 
        className={`relative bg-white shadow-lg transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-[50px]' : 'w-64'}`}
      >
        {/* 收缩按钮 */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-4 top-4 bg-white rounded-full p-1 shadow-md z-10
            hover:bg-gray-50 transition-colors duration-200"
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          )}
        </button>

        {/* 侧边栏内容 */}
        <div className={`h-full overflow-hidden ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
          {sidebar}
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  )
} 