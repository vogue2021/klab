'use client'

interface ConceptExplainerProps {
  code: string
  conceptData: any
}

export default function ConceptExplainer({ code, conceptData }: ConceptExplainerProps) {
  return (
    <div className="h-full border rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-2">概念説明</h3>
      <div className="prose">
        {conceptData ? (
          <div>{conceptData}</div>
        ) : (
          <p>トピックを選択するかコードを入力して、関連する概念の説明を表示...</p>
        )}
      </div>
    </div>
  )
} 