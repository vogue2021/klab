'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Play, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Editor from '@monaco-editor/react'
import Sidebar from '@/components/Sidebar'
import FlowchartVisualization from '@/components/FlowchartVisualization'
import MindMap from '@/components/MindMap'
import CodeAnimation from '@/components/CodeAnimation'
import VisualContent from '@/components/VisualContent'

interface Content {
  title: string
  introduction: string
  sections: Section[]
}

interface Section {
  title: string
  content: string
  codeExample: string
  explanation: string
}

export default function VisualPlatform() {
  const router = useRouter()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState('')
  const [code, setCode] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [output, setOutput] = useState('')
  const [selectedTool, setSelectedTool] = useState<'flowchart' | 'mindmap' | 'animation'>('flowchart')
  const [content, setContent] = useState<Content | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleTopicSelect = async (topic: string) => {
    if (topic !== selectedTopic) {
      setSelectedTopic(topic)
      setCode('')
      setOutput('')
      setLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/generate-learning-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic })
        })

        if (!response.ok) {
          throw new Error('コンテンツの取得に失敗しました')
        }

        const data = await response.json()
        setContent(data)
      } catch (err) {
        console.error('コンテンツの読み込みに失敗:', err)
        setError(err instanceof Error ? err.message : 'コンテンツの読み込みに失敗しました')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleBack = () => {
    router.push('/')
  }

  const analyzeCode = async () => {
    if (!code.trim() || isAnalyzing) return

    setIsAnalyzing(true)
    setOutput('')
    try {
      // 首先运行代码
      setIsRunning(true)
      const runResponse = await fetch('/api/run-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      })

      if (!runResponse.ok) {
        throw new Error('コードの実行に失敗しました')
      }

      const runData = await runResponse.json()
      setOutput(runData.output || 'コードが正常に実行されました')

      // 然���进行可视化分析
      const analysisResponse = await fetch('/api/analyze-code-flow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      })

      if (!analysisResponse.ok) {
        throw new Error('コード分析に失敗しました')
      }

      const data = await analysisResponse.json()
      if (data.error) {
        throw new Error(data.error)
      }

      // 更新可视化数据
      // 这里的处理取决于你的可视化组件需要的数据格式
    } catch (error) {
      console.error('処理に失敗:', error)
      alert(error instanceof Error ? error.message : '処理に失敗しました')
    } finally {
      setIsAnalyzing(false)
      setIsRunning(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar 
        onTopicSelect={handleTopicSelect}
        isCollapsed={isSidebarCollapsed}
        onCollapsedChange={setIsSidebarCollapsed}
      />

      <div className={`transition-all duration-300 ${
        isSidebarCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        <div className="p-4 border-b bg-white flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="ホームページに戻る"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold">Haskell視覚化学習プラットフォーム</h1>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 左側：コード入力と実行結果 + 可視化表示 */}
            <div className="space-y-6">
              {/* コードエディタと実行結果 */}
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold mb-4">Haskellコード実行と視覚化</h2>
                
                <div className="h-64 border rounded-lg overflow-hidden">
                  <Editor
                    height="100%"
                    defaultLanguage="haskell"
                    theme="vs-dark"
                    value={code}
                    onChange={(value) => setCode(value || '')}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: 'on',
                      wordWrap: 'on',
                      readOnly: isRunning || isAnalyzing,
                      automaticLayout: true
                    }}
                  />
                </div>

                {output && (
                  <div className="mt-4 bg-gray-900 text-white p-4 rounded-lg font-mono text-sm">
                    <pre className="whitespace-pre-wrap">{output}</pre>
                  </div>
                )}

                <button
                  onClick={analyzeCode}
                  disabled={isAnalyzing || isRunning || !code.trim()}
                  className="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isAnalyzing || isRunning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {isRunning ? 'コードを実行中...' : '分析中...'}
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      実行して視覚化
                    </>
                  )}
                </button>
              </div>

              {/* 可視化ツール選択と表示 */}
              <div className="bg-white p-4 rounded-lg shadow-lg">
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setSelectedTool('flowchart')}
                    className={`flex-1 py-2 px-4 rounded ${
                      selectedTool === 'flowchart' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    フローチャート
                  </button>
                  <button
                    onClick={() => setSelectedTool('mindmap')}
                    className={`flex-1 py-2 px-4 rounded ${
                      selectedTool === 'mindmap' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    マインドマップ
                  </button>
                  <button
                    onClick={() => setSelectedTool('animation')}
                    className={`flex-1 py-2 px-4 rounded ${
                      selectedTool === 'animation' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    アニメーション
                  </button>
                </div>

                <div className="h-[400px] border rounded-lg overflow-auto">
                  {selectedTool === 'flowchart' && <FlowchartVisualization code={code} />}
                  {selectedTool === 'mindmap' && <MindMap code={code} />}
                  {selectedTool === 'animation' && <CodeAnimation code={code} />}
                </div>
              </div>
            </div>

            {/* 右側：学習コンテンツエリア */}
            <div className="bg-white p-6 rounded-lg shadow-lg overflow-auto max-h-[calc(100vh-12rem)]">
              <h2 className="text-xl font-semibold mb-4">学習コンテンツ</h2>
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              ) : error ? (
                <div className="text-red-500 text-center py-8">
                  <p>{error}</p>
                </div>
              ) : content ? (
                <div className="space-y-8">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">{content.title}</h3>
                    <p className="text-blue-700">{content.introduction}</p>
                  </div>

                  {content.sections.map((section, index) => (
                    <VisualContent key={index} section={section} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  左のサイドバーからトピックを選択してください
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 