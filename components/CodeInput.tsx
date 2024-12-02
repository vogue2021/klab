'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface CodeInputProps {
  onFlowchartData: (data: any) => void
}

export default function CodeInput({ onFlowchartData }: CodeInputProps) {
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/analyze-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'コードの分析に失敗しました')
      }

      console.log('フローチャートデータを受信:', data)
      onFlowchartData(data)
    } catch (error) {
      console.error('コードの分析中にエラーが発生:', error)
      setError(error.message || 'コードの分析中にエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="ここにコードを入力してください..."
        className="h-64"
      />
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button type="submit" disabled={isLoading}>
        {isLoading ? '生成中...' : 'フローチャートを生成'}
      </Button>
    </form>
  )
}
