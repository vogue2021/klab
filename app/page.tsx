'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            プログラミング学習アシスタント
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            VARKラーニングモデルに基づくマルチディメンショナル学習プラットフォーム
          </p>
          <p className="text-md text-gray-500">
            視覚的(Visual) · 聴覚的(Aural) · 読み書き(Read/Write) · 運動感覚的(Kinesthetic)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Visual - 視覚学習 */}
          <Link href="/visual" className="transform hover:scale-105 transition-transform duration-200">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-3xl mb-4">🎨</div>
              <h2 className="text-2xl font-semibold mb-2">視覚化学習</h2>
              <p className="text-gray-600">
                フローチャート、マインドマップ、アニメーションでHaskellの関数型プログラミングを理解する
              </p>
            </div>
          </Link>

          {/* Aural - 聴覚学習 */}
          <Link href="/audio" className="transform hover:scale-105 transition-transform duration-200">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-3xl mb-4">🎧</div>
              <h2 className="text-2xl font-semibold mb-2">音声教育</h2>
              <p className="text-gray-600">
                AI音声解説、コード朗読、インタラクティブな対話でHaskellの純粋関数の概念を学ぶ
              </p>
            </div>
          </Link>

          {/* Read/Write - 読み書き学習 */}
          <Link href="/read-write" className="transform hover:scale-105 transition-transform duration-200">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-3xl mb-4">📚</div>
              <h2 className="text-2xl font-semibold mb-2">読み書き練習</h2>
              <p className="text-gray-600">
                型システム、モナド、パターンマッチングなどHaskellの基本概念の習得
              </p>
            </div>
          </Link>

          {/* Kinesthetic - 運動感覚学習 */}
          <Link href="/practice" className="transform hover:scale-105 transition-transform duration-200">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-3xl mb-4">⌨️</div>
              <h2 className="text-2xl font-semibold mb-2">実践学習</h2>
              <p className="text-gray-600">
                関数型プログラミング演習、再帰処理の実装、即時フィードバックで学習成果を強化
              </p>
            </div>
          </Link>
        </div>

        {/* AI アシスタント部分 */}
        <div className="mt-12">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-center gap-4">
              <div className="text-3xl">🤖</div>
              <h2 className="text-2xl font-semibold">AI 学習アシスタント</h2>
            </div>
            <p className="text-center text-gray-600 mt-2">
              すべての学習モードを網羅するインテリジェントな指導システムで、パーソナライズされた学習アドバイスと解答を提供
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="font-medium">視覚分析</p>
                <p className="text-sm text-gray-600">関数評価の視覚化解析</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="font-medium">音声対話</p>
                <p className="text-sm text-gray-600">インテリジェント音声インタラクション</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="font-medium">テキストガイド</p>
                <p className="text-sm text-gray-600">パーソナライズされた学習アドバイス</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="font-medium">実践指導</p>
                <p className="text-sm text-gray-600">関数型プログラミングガイド</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
