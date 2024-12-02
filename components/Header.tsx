'use client'

export default function Header() {
  return (
    <header className="border-b bg-white">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">Python可視化学習プラットフォーム</h1>
        </div>
        
        <nav className="flex items-center space-x-4">
          <button className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
            チュートリアル
          </button>
          <button className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
            練習
          </button>
          <button className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
            ヘルプ
          </button>
        </nav>
      </div>
    </header>
  )
} 