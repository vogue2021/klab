'use client'

import { useState, useRef, useEffect } from 'react'
import { ArrowLeft, Play, Pause, Volume2, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Editor from '@monaco-editor/react'
import Sidebar from '@/components/Sidebar'
import AudioContent from '@/components/AudioContent'

// 添加一个辅助函数来处理代码高亮
const formatExplanation = (text: string) => {
  // 将 `code` 包裹的内容用特殊样式显示
  return text.split(/(`[^`]+`)/).map((part, index) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      // 移除前后的反引号并添加特殊样式
      return (
        <code key={index} className="px-1.5 py-0.5 bg-gray-100 text-blue-600 rounded font-mono text-sm">
          {part.slice(1, -1)}
        </code>
      )
    }
    return <span key={index}>{part}</span>
  })
}

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
  const [isRunning, setIsRunning] = useState(false)
  const [output, setOutput] = useState('')

  const handleTopicSelect = (topic: string) => {
    if (topic !== selectedTopic) {
      setSelectedTopic(topic)
      setShowLearningContent(true)
      setCode('')
      setExplanation('')
      setIsPlaying(false)
      if (audioRef.current) {
        audioRef.current.src = ''
      }
    }
  }

  useEffect(() => {
    if (selectedTopic) {
      setShowLearningContent(true)
    }
  }, [selectedTopic])

  const handleBack = () => {
    router.push('/')
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const percentage = x / rect.width
      audioRef.current.currentTime = percentage * duration
    }
  }

  const analyzeCode = async () => {
    if (!code.trim() || isAnalyzing) return

    setIsAnalyzing(true)
    setOutput('')
    try {
      // 首先运行代码
      setIsRunning(true)
      const runResponse = await fetch('/api/run-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      })

      if (!runResponse.ok) {
        throw new Error('コードの実行に失敗しました')
      }

      const runData = await runResponse.json()
      setOutput(runData.output || 'コードが正常に実行されました')

      // 然后进行 AI 分析
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

      setExplanation(data.explanation)

      // 生成音频
      const audioResponse = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: data.explanation })
      })

      if (!audioResponse.ok) {
        throw new Error('音声の生成に失敗しました')
      }

      const audioBlob = await audioResponse.blob()
      const audioUrl = URL.createObjectURL(audioBlob)

      if (audioRef.current) {
        audioRef.current.src = audioUrl
        setIsPlaying(false)
      }
    } catch (error) {
      console.error('処理に失敗:', error)
      alert(error instanceof Error ? error.message : '処理に失敗しました')
    } finally {
      setIsAnalyzing(false)
      setIsRunning(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar 
        onTopicSelect={handleTopicSelect}
        isCollapsed={isSidebarCollapsed}
        onCollapsedChange={setIsSidebarCollapsed}
      />

      <div className={`transition-all duration-300 ${
        isSidebarCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        <div className="p-4 border-b bg-white flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="ホームページに戻る"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold">Haskell音声学習プラットフォーム</h1>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 左側：コード入力と音声再生エリア */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold mb-4">Haskellコード分析と音声解説</h2>
                
                <div className="h-64 border rounded-lg overflow-hidden">
                  <Editor
                    height="100%"
                    defaultLanguage="haskell"
                    theme="vs-dark"
                    value={code}
                    onChange={(value) => setCode(value || '')}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: 'on',
                      wordWrap: 'on',
                      readOnly: isRunning || isAnalyzing,
                      automaticLayout: true
                    }}
                  />
                </div>

                {output && (
                  <div className="mt-4 bg-gray-900 text-white p-4 rounded-lg font-mono text-sm">
                    <pre className="whitespace-pre-wrap">{output}</pre>
                  </div>
                )}

                <button
                  onClick={analyzeCode}
                  disabled={isAnalyzing || isRunning || !code.trim()}
                  className="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isAnalyzing || isRunning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {isRunning ? 'コードを実行中...' : '分析中...'}
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      実行して分析
                    </>
                  )}
                </button>
              </div>

              {explanation && (
                <div className="bg-white p-6 rounded-lg shadow-lg">
                  <h3 className="text-lg font-semibold mb-4">AI解説：</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {formatExplanation(explanation)}
                  </p>
                  
                  <div className="mt-4 space-y-4">
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
                </div>
              )}
            </div>

            {/* 右側：学習コンテンツエリア */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4">学習コンテンツ</h2>
              {selectedTopic ? (
                <AudioContent 
                  key={selectedTopic}
                  topic={selectedTopic}
                  onClose={() => {
                    setShowLearningContent(false)
                    setSelectedTopic('')
                  }}
                />
              ) : (
                <p className="text-gray-500 text-center py-8">
                  左のサイドバーからトピックを選択してください
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 非表示のオーディオ要素 */}
      <audio 
        ref={audioRef}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />
    </div>
  )
} 