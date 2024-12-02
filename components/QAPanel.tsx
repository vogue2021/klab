'use client'

interface QAPanelProps {
  context: string
}

export default function QAPanel({ context }: QAPanelProps) {
  return (
    <div className="h-full p-4">
      <h3 className="text-lg font-semibold mb-2">Q&A アシスタント</h3>
      <div className="h-full flex flex-col">
        <div className="flex-1 border rounded-lg p-2 mb-2 overflow-auto">
          {/* ここに会話履歴が表示されます */}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="質問を入力してください..."
            className="flex-1 px-3 py-2 border rounded"
          />
          <button className="px-4 py-2 bg-blue-500 text-white rounded">
            送信
          </button>
        </div>
      </div>
    </div>
  )
} 