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

  // 处理主题选择
  const handleTopicSelect = (topic: string) => {
    setSelectedTopic(topic)
    setShowLearningContent(true)
  }

  // 初始化音频上下文
  const initAudio = async () => {
    try {
      // 创建音频上下文（需要用户交互）
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      const audioContext = new AudioContext()
      
      if (audioContext.state === 'suspended') {
        await audioContext.resume()
      }
    } catch (err) {
      console.error('初始化音频失败:', err)
    }
  }

  // 修改分析代码函数
  const analyzeCode = async () => {
    if (!code.trim()) return

    setIsAnalyzing(true)
    try {
      // 获取 AI 分析结果
      console.log('开始分析代码...')
      const analysisResponse = await fetch('/api/analyze-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      })

      if (!analysisResponse.ok) {
        throw new Error('代码分析失败')
      }

      const data = await analysisResponse.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      const explanation = data.explanation
      console.log('AI 解释生成成功:', explanation)
      setExplanation(explanation)

      // 生成语音
      console.log('开始生成语音...')
      const audioResponse = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: explanation })
      })

      if (!audioResponse.ok) {
        const errorData = await audioResponse.json()
        throw new Error(errorData.details || '语音生成失败')
      }

      console.log('语音生成成功，准备播放')
      const audioBlob = await audioResponse.blob()
      const audioUrl = URL.createObjectURL(audioBlob)

      if (audioRef.current) {
        try {
          audioRef.current.src = audioUrl
          await audioRef.current.play()
          setIsPlaying(true)
          console.log('音频开始播放')
        } catch (playError) {
          console.error('播放音频失败:', playError)
          alert('播放音频需要用户交互，请点击播放按钮')
        }
      }
    } catch (err) {
      console.error('处理失败:', err)
      setIsAnalyzing(false) // 确保状态被重置
      alert(err instanceof Error ? err.message : '处理失败')
    } finally {
      setIsAnalyzing(false)
    }
  }

  // 修改播放/暂停函数
  const togglePlay = async () => {
    if (audioRef.current) {
      try {
        await initAudio() // 确保音频上下文已初始化
        
        if (isPlaying) {
          audioRef.current.pause()
        } else {
          await audioRef.current.play()
        }
        setIsPlaying(!isPlaying)
      } catch (err) {
        console.error('播放控制失败:', err)
      }
    }
  }

  // 更新进度条
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  // 获取音频总时长
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  // 处理进度条点击
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

  // 格式化时间
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // 处理返回
  const handleBack = () => {
    router.push('/')
  }

  // 组件卸载时清理
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
      {/* 左侧菜单 */}
      <Sidebar 
        onTopicSelect={handleTopicSelect}
        isCollapsed={isSidebarCollapsed}
        onCollapsedChange={setIsSidebarCollapsed}
      />

      {/* 主要内容区域 */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        isSidebarCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        {/* 顶部标题栏 */}
        <div className="p-4 border-b bg-white flex items-center gap-4">
          {/* 返回按钮 */}
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="返回主页"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">Python语音教学平台</h1>
        </div>
        
        {/* 主要内容区域 */}
        <div className="flex-1 p-8">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-xl font-semibold">代码分析</h2>

            {/* 音频播放控制 */}
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

            {/* 代码输入区域 */}
            <div className="space-y-4">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-48 p-4 font-mono text-sm border rounded-lg"
                placeholder="在这里输入 Python 代码..."
              />
              <button
                onClick={analyzeCode}
                disabled={isAnalyzing || !code.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {isAnalyzing ? '分析中...' : '分析代码'}
              </button>
            </div>

            {/* AI 解释显示区域 */}
            {explanation && (
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4">AI 解释：</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{explanation}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 学习内容覆盖层 */}
      {showLearningContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="absolute inset-y-0 right-0 w-2/3 bg-white shadow-lg">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">{selectedTopic}</h2>
              <button 
                onClick={() => setShowLearningContent(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                关闭
              </button>
            </div>
            <AudioContent 
              topic={selectedTopic}
              onClose={() => setShowLearningContent(false)}
            />
          </div>
        </div>
      )}

      {/* 隐藏的音频元素 */}
      <audio ref={audioRef} className="hidden" />
    </div>
  )
} 