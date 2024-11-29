'use client'

import { useEffect, useState } from 'react'
import { Pause, Play, RotateCcw, StepBack, StepForward } from 'lucide-react'

interface ExecutionStep {
  lineNumber: number
  code: string
  explanation: string
  variables: { [key: string]: any }
  output?: string
}

export default function CodeAnimation({ code }: { code: string }) {
  const [steps, setSteps] = useState<ExecutionStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(2000)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!code) return
    
    const analyzeCode = async () => {
      setLoading(true)
      setError(null)
      try {
        console.log('Sending code for analysis:', code)
        
        const response = await fetch('/api/analyze-animation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code })
        })

        const data = await response.json()
        console.log('Received response:', data)

        if (!response.ok) {
          throw new Error(data.error || '分析代码失败')
        }

        if (!data.steps || !Array.isArray(data.steps)) {
          throw new Error('返回的数据格式不正确')
        }

        setSteps(data.steps)
        setCurrentStep(0)
        setIsPlaying(false)
      } catch (err) {
        console.error('Animation analysis error:', err)
        setError(err instanceof Error ? err.message : '未知错误')
      } finally {
        setLoading(false)
      }
    }

    analyzeCode()
  }, [code])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isPlaying && currentStep < steps.length - 1) {
      timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1)
      }, speed)
    } else if (currentStep === steps.length - 1) {
      setIsPlaying(false)
    }
    return () => clearTimeout(timer)
  }, [isPlaying, currentStep, steps.length, speed])

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-4">
        <div className="text-red-500 mb-4">分析出错</div>
        <div className="text-gray-600 text-sm">{error}</div>
        <button 
          onClick={() => setError(null)}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          重试
        </button>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* 工具栏 */}
      <div className="h-12 border-b bg-white px-4 flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-700">代码执行动画</h2>
        <div className="flex items-center gap-2">
          <select 
            className="px-2 py-1 border rounded"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          >
            <option value={3000}>慢速</option>
            <option value={2000}>正常</option>
            <option value={1000}>快速</option>
          </select>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="flex-1 grid grid-cols-2 gap-4 p-4 overflow-hidden">
        {/* 代码显示区域 */}
        <div className="overflow-auto border rounded-lg bg-gray-50">
          <div className="p-4 font-mono text-sm">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`px-4 py-1 transition-colors ${
                  index === currentStep
                    ? 'bg-blue-100 border-l-4 border-blue-500'
                    : ''
                }`}
              >
                <span className="mr-4 text-gray-400">{step.lineNumber}</span>
                <span>{step.code}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 执行说明和变量状态 */}
        <div className="overflow-auto border rounded-lg p-4">
          {steps[currentStep] && (
            <>
              <div className="mb-4">
                <h3 className="font-medium mb-2">执行说明</h3>
                <p className="text-gray-600">{steps[currentStep].explanation}</p>
              </div>
              
              <div className="mb-4">
                <h3 className="font-medium mb-2">变量状态</h3>
                <div className="bg-gray-50 p-3 rounded">
                  {Object.entries(steps[currentStep].variables).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-blue-600">{key}:</span>
                      <span className="font-mono">{JSON.stringify(value)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {steps[currentStep].output && (
                <div>
                  <h3 className="font-medium mb-2">输出</h3>
                  <pre className="bg-gray-50 p-3 rounded font-mono text-sm">
                    {steps[currentStep].output}
                  </pre>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 控制按钮 */}
      <div className="h-16 border-t bg-gray-50 px-4 flex items-center justify-center gap-4">
        <button
          onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
          className="p-2 hover:bg-gray-200 rounded-full disabled:opacity-50"
          disabled={currentStep === 0}
        >
          <StepBack className="w-5 h-5" />
        </button>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-2 hover:bg-gray-200 rounded-full"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5" />
          )}
        </button>
        <button
          onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
          className="p-2 hover:bg-gray-200 rounded-full disabled:opacity-50"
          disabled={currentStep === steps.length - 1}
        >
          <StepForward className="w-5 h-5" />
        </button>
        <button
          onClick={() => {
            setCurrentStep(0)
            setIsPlaying(false)
          }}
          className="p-2 hover:bg-gray-200 rounded-full"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
} 