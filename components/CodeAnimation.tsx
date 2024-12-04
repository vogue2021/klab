'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  code: string
}

interface AnimationStep {
  line: number
  explanation: string
  variables: Record<string, any>
}

export default function CodeAnimation({ code }: Props) {
  const [steps, setSteps] = useState<AnimationStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (!code) {
      setSteps([])
      setCurrentStep(0)
      setError(null)
      return
    }

    const analyzeCode = async () => {
      try {
        const response = await fetch('/api/analyze-code-animation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code })
        })

        if (!response.ok) {
          throw new Error('アニメーション分析に失敗しました')
        }

        const data = await response.json()
        if (data.error) {
          throw new Error(data.error)
        }

        setSteps(data.steps || [])
        setCurrentStep(0)
        setError(null)
      } catch (err) {
        console.error('アニメーション生成エラー:', err)
        setError(err instanceof Error ? err.message : 'アニメーションの生成に失敗しました')
        setSteps([])
        setCurrentStep(0)
      }
    }

    analyzeCode()
  }, [code])

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, 2000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, steps.length])

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const reset = () => {
    setCurrentStep(0)
    setIsPlaying(false)
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  if (!code || steps.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">コードを入力してアニメーションを生成してください</p>
      </div>
    )
  }

  const currentStepData = steps[currentStep]
  const codeLines = code.split('\n')

  return (
    <div className="h-full flex flex-col">
      {/* コード表示部分 */}
      <div className="flex-1 bg-gray-900 p-4 rounded-lg overflow-auto font-mono text-sm">
        {codeLines.map((line, index) => (
          <div
            key={index}
            className={`px-2 ${
              currentStepData.line === index
                ? 'bg-blue-500 bg-opacity-20 text-white'
                : 'text-gray-300'
            }`}
          >
            {line}
          </div>
        ))}
      </div>

      {/* 変数状態表示 */}
      <div className="mt-4 bg-gray-800 p-4 rounded-lg">
        <h3 className="text-white text-sm font-semibold mb-2">変数の状態：</h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(currentStepData.variables || {}).map(([key, value]) => (
            <div
              key={key}
              className="bg-gray-700 p-2 rounded transition-all duration-300 transform hover:scale-105"
            >
              <span className="text-blue-300">{key}: </span>
              <span className="text-white">{JSON.stringify(value)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 説明テキスト */}
      <div className="mt-4 bg-blue-50 p-4 rounded-lg">
        <p className="text-blue-800">{currentStepData.explanation}</p>
      </div>

      {/* コントロール */}
      <div className="mt-4 flex justify-center gap-4">
        <button
          onClick={togglePlay}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          {isPlaying ? '一時停止' : '再生'}
        </button>
        <button
          onClick={reset}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
        >
          リセット
        </button>
      </div>
    </div>
  )
} 