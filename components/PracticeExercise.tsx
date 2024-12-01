'use client'

import { useState } from 'react'
import { Play, Loader2 } from 'lucide-react'
import Editor from '@monaco-editor/react'

interface PracticeExerciseProps {
  exercise: {
    question: string
    initialCode: string
  }
  index: number
}

export default function PracticeExercise({ exercise, index }: PracticeExerciseProps) {
  const [code, setCode] = useState(exercise.initialCode)
  const [output, setOutput] = useState('')
  const [feedback, setFeedback] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [isEvaluating, setIsEvaluating] = useState(false)

  const runCode = async () => {
    if (isRunning) return
    setIsRunning(true)
    setOutput('')
    setFeedback('')

    try {
      // 运行代码
      const response = await fetch('/api/run-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || '运行代码失败')
      }

      if (data.error) {
        setOutput(`错误: ${data.error}`)
        return
      }

      setOutput(data.output || '代码执行成功，无输出')

      // 获取 AI 评价
      setIsEvaluating(true)
      const feedbackResponse = await fetch('/api/evaluate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          output: data.output,
          question: exercise.question
        })
      })

      if (!feedbackResponse.ok) {
        throw new Error('获取评价失败')
      }

      const feedbackData = await feedbackResponse.json()
      setFeedback(feedbackData.feedback || '暂无评价')
    } catch (error) {
      setOutput(`运行错误: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setIsRunning(false)
      setIsEvaluating(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">练习 {index}</h3>
        <p className="mt-2 text-gray-600">{exercise.question}</p>
      </div>

      <div className="space-y-4">
        <div className="border rounded-lg overflow-hidden">
          <Editor
            height="200px"
            defaultLanguage="python"
            value={code}
            onChange={(value) => setCode(value || '')}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 4,
              wordWrap: 'on',
              readOnly: isRunning
            }}
          />
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={runCode}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                运行中...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                运行代码
              </>
            )}
          </button>
        </div>

        {output && (
          <div className="bg-gray-900 text-white p-4 rounded-lg font-mono text-sm">
            <pre className="whitespace-pre-wrap">{output}</pre>
          </div>
        )}

        {isEvaluating && (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            AI 老师正在评价...
          </div>
        )}

        {feedback && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">AI 老师评价：</h4>
            <p className="text-blue-900">{feedback}</p>
          </div>
        )}
      </div>
    </div>
  )
} 