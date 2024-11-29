'use client'

interface ConceptExplainerProps {
  code: string
  conceptData: any
}

export default function ConceptExplainer({ code, conceptData }: ConceptExplainerProps) {
  return (
    <div className="h-full border rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-2">概念解释</h3>
      <div className="prose">
        {conceptData ? (
          <div>{conceptData}</div>
        ) : (
          <p>选择一个主题或输入代码来查看相关概念解释...</p>
        )}
      </div>
    </div>
  )
} 