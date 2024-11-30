'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2, SkipBack, SkipForward } from 'lucide-react'
import AudioRecorder from './AudioRecorder'

interface AudioContentProps {
  topic: string
  onClose: () => void
}

interface Section {
  title: string
  content: string
  codeExample?: string
  explanation?: string
}

interface AudioContent {
  title: string
  introduction: string
  sections: Section[]
  keyPoints: string[]
  exercises: string[]
}

export default function AudioContent({ topic, onClose }: AudioContentProps) {
  const [content, setContent] = useState<AudioContent | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSection, setCurrentSection] = useState(0)
  const [userQuestion, setUserQuestion] = useState('')
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  // 获取内容
  const fetchContent = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/analyze-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      })

      if (!response.ok) {
        throw new Error('获取内容失败')
      }

      const data = await response.json()
      setContent(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }

  // 首次加载时获取内容
  useState(() => {
    fetchContent()
  }, [topic])

  // 处理语音转文字结果
  const handleTranscription = (text: string) => {
    setUserQuestion(text)
    // 这里可以添加其他处理逻辑，比如自动提交问题等
  }

  // 获取语音内容
  const fetchAudio = async (content: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      })

      if (!response.ok) {
        throw new Error('获取语音失败')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setAudioUrl(url)
      
      // 创建音频元素
      if (!audioRef.current) {
        audioRef.current = new Audio(url)
        audioRef.current.addEventListener('timeupdate', handleTimeUpdate)
        audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata)
      } else {
        audioRef.current.src = url
      }
    } catch (err) {
      console.error('加载音频失败:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // 处理播放/暂停
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

  // 格式化时间
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
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

  // 内容变化时获取新的音频
  useEffect(() => {
    if (content) {
      fetchAudio(content.introduction)
    }
  }, [content])

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('timeupdate', handleTimeUpdate)
        audioRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata)
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  // 修改播放控制栏
  const renderPlayControls = () => (
    <div className="sticky top-0 bg-white shadow p-4 mb-6 rounded-lg">
      <div className="flex items-center gap-4 mb-2">
        <button 
          onClick={togglePlay}
          className="p-2 rounded-full hover:bg-gray-100"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
          ) : isPlaying ? (
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
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-500 p-4">
        错误: {error}
      </div>
    )
  }

  if (!content) {
    return null
  }

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">{content.title}</h1>
        {renderPlayControls()}

        {/* 内容区域 */}
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-2">简介</h2>
            <p className="text-gray-700">{content.introduction}</p>
          </section>

          {content.sections.map((section, index) => (
            <section key={index} className="border-l-4 border-blue-500 pl-4">
              <h2 className="text-xl font-semibold mb-2">{section.title}</h2>
              <p className="text-gray-700 mb-4">{section.content}</p>
              {section.codeExample && (
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <pre className="text-sm">
                    <code>{section.codeExample}</code>
                  </pre>
                  {section.explanation && (
                    <p className="mt-2 text-gray-600">{section.explanation}</p>
                  )}
                </div>
              )}
            </section>
          ))}

          <section>
            <h2 className="text-xl font-semibold mb-2">关键要点</h2>
            <ul className="list-disc list-inside space-y-2">
              {content.keyPoints.map((point, index) => (
                <li key={index} className="text-gray-700">{point}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">练习</h2>
            <ul className="list-decimal list-inside space-y-2">
              {content.exercises.map((exercise, index) => (
                <li key={index} className="text-gray-700">{exercise}</li>
              ))}
            </ul>
          </section>
        </div>

        {/* 添加语音输入部分 */}
        <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">语音提问</h3>
            <AudioRecorder onTranscription={handleTranscription} />
          </div>
          {userQuestion && (
            <div className="mt-2">
              <p className="text-sm text-gray-600">识别结果：</p>
              <p className="text-gray-800">{userQuestion}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 