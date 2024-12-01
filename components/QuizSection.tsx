'use client'

import { useState } from 'react'
import { Check, X } from 'lucide-react'

interface QuizSectionProps {
  quiz: {
    type: 'choice' | 'code'
    question: string
    options?: string[]
    code?: string
    answer: string | number
    explanation: string
  }
  index: number
}

export default function QuizSection({ quiz, index }: QuizSectionProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)

  const handleSubmit = () => {
    if (selectedAnswer !== null) {
      setShowResult(true)
    }
  }

  const isCorrect = selectedAnswer === String(quiz.answer)

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">练习 {index}</h3>
        <p className="mt-2 text-gray-600">{quiz.question}</p>
      </div>

      <div className="space-y-4">
        {quiz.type === 'choice' ? (
          // 选择题
          <div className="space-y-2">
            {quiz.options?.map((option, optionIndex) => (
              <button
                key={optionIndex}
                onClick={() => !showResult && setSelectedAnswer(String(optionIndex))}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  selectedAnswer === String(optionIndex)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-500'
                } ${showResult ? 'cursor-default' : 'hover:bg-gray-50'}`}
                disabled={showResult}
              >
                {option}
              </button>
            ))}
          </div>
        ) : (
          // 代码补全题
          <div className="space-y-2">
            <div className="bg-gray-900 p-4 rounded-lg">
              <pre className="text-white font-mono text-sm whitespace-pre-wrap">
                {quiz.code?.replace('___', '________')}
              </pre>
            </div>
            <input
              type="text"
              value={selectedAnswer || ''}
              onChange={(e) => !showResult && setSelectedAnswer(e.target.value)}
              placeholder="请输入缺失的代码"
              className="w-full p-2 border rounded"
              disabled={showResult}
            />
          </div>
        )}

        {!showResult && (
          <button
            onClick={handleSubmit}
            disabled={!selectedAnswer}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            提交答案
          </button>
        )}

        {showResult && (
          <div className={`p-4 rounded-lg ${
            isCorrect ? 'bg-green-50' : 'bg-red-50'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {isCorrect ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <X className="w-5 h-5 text-red-500" />
              )}
              <span className={`font-semibold ${
                isCorrect ? 'text-green-700' : 'text-red-700'
              }`}>
                {isCorrect ? '回答正确！' : '回答错误'}
              </span>
            </div>
            <p className={isCorrect ? 'text-green-600' : 'text-red-600'}>
              {quiz.explanation}
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 