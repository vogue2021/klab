'use client'

interface QAPanelProps {
  context: string
}

export default function QAPanel({ context }: QAPanelProps) {
  return (
    <div className="h-full p-4">
      <h3 className="text-lg font-semibold mb-2">问答助手</h3>
      <div className="h-full flex flex-col">
        <div className="flex-1 border rounded-lg p-2 mb-2 overflow-auto">
          {/* 这里将显示对话历史 */}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="输入你的问题..."
            className="flex-1 px-3 py-2 border rounded"
          />
          <button className="px-4 py-2 bg-blue-500 text-white rounded">
            发送
          </button>
        </div>
      </div>
    </div>
  )
} 