'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import AudioContent from '@/components/AudioContent'

export default function AudioLearning() {
  const router = useRouter()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [showLearningContent, setShowLearningContent] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState('')
  const [code, setCode] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [explanation, setExplanation] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // トピックの選択を処理する
  const handleTopicSelect = (topic: string) => {
    setSelectedTopic(topic)
    setShowLearningContent(true)
  }

  // オーディオコンテキストを初期化する
  const initAudio = async () => {
    try {
      // オーディオコンテキストを作成（ユーザーの操作が必要）
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      const audioContext = new AudioContext()
      
      if (audioContext.state === 'suspended') {
        await audioContext.resume()
      }
    } catch (err) {
      console.error('オーディオの初期化に失敗しました:', err)
    }
  }

  // コード分析関数を修正
  const analyzeCode = async () => {
    if (!code.trim()) return

    setIsAnalyzing(true)
    try {
      // AI分析結果を取得
      console.log('コードの分析を開始...', code)
      const analysisResponse = await fetch('/api/analyze-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      })

      if (!analysisResponse.ok) {
        throw new Error('コード分析に失敗しました')
      }

      const data = await analysisResponse.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      const explanation = data.explanation
      console.log('AI説明の生成に成功:', explanation)
      setExplanation(explanation)

      // 音声を生成
      console.log('音声の生成を開始...')
      const audioResponse = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: explanation })
      })

      if (!audioResponse.ok) {
        const errorData = await audioResponse.json()
        throw new Error(errorData.details || '音声の生成に失敗しました')
      }

      console.log('音声の生成に成功、再生準備中')
      const audioBlob = await audioResponse.blob()
      const audioUrl = URL.createObjectURL(audioBlob)

      if (audioRef.current) {
        try {
          audioRef.current.src = audioUrl
          await audioRef.current.play()
          setIsPlaying(true)
          console.log('オーディオの再生を開始')
        } catch (playError) {
          console.error('オーディオの再生に失敗:', playError)
          alert('オーディオの再生にはユーザーの操作が必要です。再生ボタンをクリックしてください')
        }
      }
    } catch (err) {
      console.error('処理に失敗:', err)
      setIsAnalyzing(false) // 状態をリセット
      alert(err instanceof Error ? err.message : '処理に失敗しました')
    } finally {
      setIsAnalyzing(false)
    }
  }

  // 再生/一時停止関数を修正
  const togglePlay = async () => {
    if (audioRef.current) {
      try {
        await initAudio() // オーディオコンテキストが初期化されていることを確認
        
        if (isPlaying) {
          audioRef.current.pause()
        } else {
          await audioRef.current.play()
        }
        setIsPlaying(!isPlaying)
      } catch (err) {
        console.error('再生制御に失敗:', err)
      }
    }
  }

  // プログレスバーを更新
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  // オーディオの総時間を取得
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  // プログレスバーのクリックを処理
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const percent = x / rect.width
      const newTime = percent * duration
      audioRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  // 時間をフォーマット
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // 戻る処理
  const handleBack = () => {
    router.push('/')
  }

  // コンポーネントのアンマウント時にクリーンアップ
  useEffect(() => {
    const audio = audioRef.current
    if (audio) {
      audio.addEventListener('timeupdate', handleTimeUpdate)
      audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    }
    return () => {
      if (audio) {
        audio.removeEventListener('timeupdate', handleTimeUpdate)
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      }
    }
  }, [])

  return (
    <div className="flex h-screen">
      {/* サイドメニュー */}
      <Sidebar 
        onTopicSelect={handleTopicSelect}
        isCollapsed={isSidebarCollapsed}
        onCollapsedChange={setIsSidebarCollapsed}
      />

      {/* メインコンテンツエリア */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        isSidebarCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        {/* タイトルバー */}
        <div className="p-4 border-b bg-white flex items-center gap-4">
          {/* 戻るボタン */}
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="ホームに戻る"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">Haskellボイス学習プラットフォーム</h1>
        </div>
        
        {/* メインコンテンツエリア */}
        <div className="flex-1 p-8">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-xl font-semibold">コード分析</h2>

            {/* オーディオ再生コントロール */}
            {explanation && (
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={togglePlay}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6" />
                    ) : (
                      <Play className="w-6 h-6" />
                    )}
                  </button>
                  <Volume2 className="w-6 h-6" />
                  <div 
                    className="flex-1 h-2 bg-gray-200 rounded-full cursor-pointer"
                    onClick={handleProgressClick}
                  >
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>
              </div>
            )}

            {/* コード入力エリア */}
            <div className="space-y-4">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-48 p-4 font-mono text-sm border rounded-lg"
                placeholder="ここにHaskellコードを入力してください..."
              />
              <button
                onClick={analyzeCode}
                disabled={isAnalyzing || !code.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {isAnalyzing ? '分析中...' : 'コードを分析'}
              </button>
            </div>

            {/* AI説明表示エリア */}
            {explanation && (
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4">AI説明：</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{explanation}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 学習コンテンツオーバーレイ */}
      {showLearningContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="absolute inset-y-0 right-0 w-2/3 bg-white shadow-lg">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">{selectedTopic}</h2>
              <button 
                onClick={() => setShowLearningContent(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                閉じる
              </button>
            </div>
            <AudioContent 
              topic={selectedTopic}
              onClose={() => setShowLearningContent(false)}
            />
          </div>
        </div>
      )}

      {/* 非表示のオーディオ要素 */}
      <audio ref={audioRef} className="hidden" />
    </div>
  )
} 