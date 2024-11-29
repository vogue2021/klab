'use client'

export default function Header() {
  return (
    <header className="border-b bg-white">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">Python可视化学习平台</h1>
        </div>
        
        <nav className="flex items-center space-x-4">
          <button className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
            教程
          </button>
          <button className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
            练习
          </button>
          <button className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
            帮助
          </button>
        </nav>
      </div>
    </header>
  )
} 