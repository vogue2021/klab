'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Play, Loader2 } from 'lucide-react'
import Editor from '@monaco-editor/react'

// グローバル Pyodide タイプを宣言
declare global {
  interface Window {
    loadPyodide: any
    pyodide: any
  }
}

interface PracticeLearningContentProps {
  topic: string
  onClose: () => void
}

interface Section {
  title: string
  content: string
  codeExample: string
  explanation: string
}

interface Content {
  title: string
  introduction: string
  sections: Section[]
}

interface CodeBlockProps {
  code: string
  height?: string
}

// 実行可能なコードブロックコンポーネント
function RunnableCodeBlock({ code: initialCode, height = "200px" }: CodeBlockProps) {
  const [code, setCode] = useState(initialCode)
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [pyodide, setPyodide] = useState<any>(null)
  const [inputValue, setInputValue] = useState('')
  const [waitingForInput, setWaitingForInput] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Pyodide を初期化
  useEffect(() => {
    async function initPyodide() {
      try {
        if (window.pyodide) {
          setPyodide(window.pyodide)
          return
        }

        const pyodide = await window.loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/"
        })

        // Python環境を初期化し、入力シミュレーション関数を設定
        await pyodide.runPythonAsync(`
          import sys
          import io
          from js import prompt
          
          class CustomIO(io.StringIO):
              def __init__(self):
                  super().__init__()
                  self.output = ""
              
              def write(self, text):
                  self.output += text
                  return len(text)
              
              def getvalue(self):
                  return self.output
          
          def custom_input(prompt_text=""):
              # JavaScriptのprompt関数を使用して入力を取得
              result = prompt(prompt_text)
              if result is None:
                  raise EOFError("ユーザーが入力をキャンセルしました")
              return result
          
          # 標準出力とエラー出力を初期化
          sys.stdout = CustomIO()
          sys.stderr = CustomIO()
          __builtins__.input = custom_input
        `)

        window.pyodide = pyodide
        setPyodide(pyodide)
      } catch (error) {
        console.error('Pyodide の初期化に失敗:', error)
      }
    }
    initPyodide()
  }, [])

  // ユーザー入力を処理
  const handleInput = async (value: string) => {
    setWaitingForInput(false)
    setInputValue('')
    return value
  }

  // コードを実行
  const runCode = async () => {
    if (!pyodide || isRunning) return

    setIsRunning(true)
    setOutput('')

    try {
      // 出力バッファをリセット
      await pyodide.runPythonAsync(`
        sys.stdout = CustomIO()
        sys.stderr = CustomIO()
      `)

      // グローバルprompt関数を設定
      ;(globalThis as any).prompt = (text: string) => {
        setOutput(prev => prev + text)
        const value = window.prompt(text)
        if (value !== null) {
          setOutput(prev => prev + value + '\n')
        }
        return value
      }

      // ユーザーコードを実行
      const wrappedCode = `
try:
    ${initialCode.split('\n').join('\n    ')}
except Exception as e:
    print(f"エラー: {str(e)}")
`
      const result = await pyodide.runPythonAsync(wrappedCode)

      // 出力を取得
      const stdout = await pyodide.runPythonAsync('sys.stdout.getvalue()')
      const stderr = await pyodide.runPythonAsync('sys.stderr.getvalue()')

      // 出力を結合
      let output = ''
      if (stdout) output += stdout
      if (stderr) output += stderr
      if (result !== undefined && !stdout && !stderr) {
        output += String(result)
      }

      setOutput(prev => prev + (output || 'コードが正常に実行されました。出力はありません'))
    } catch (error) {
      setOutput(`システムエラー: ${error}`)
    } finally {
      setIsRunning(false)
      // グローバルprompt関数をクリーンアップ
      delete (globalThis as any).prompt
    }
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* コードエディタ */}
      <div className="border-b">
        <Editor
          height={height}
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
            readOnly: isRunning, // 実行中は編集を禁止
            debugger: {
              enabled: false
            },
            links: false,
            contextmenu: false
          }}
          beforeMount={(monaco) => {
            // 不要な機能を無効化
            monaco.editor.defineTheme('custom-dark', {
              base: 'vs-dark',
              inherit: true,
              rules: [],
              colors: {}
            })
          }}
        />
      </div>

      {/* コントロールバー */}
      <div className="bg-gray-100 px-4 py-2 flex justify-between items-center">
        <button
          onClick={runCode}
          disabled={isRunning || !pyodide}
          className="flex items-center gap-2 px-3 py-1.5 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              実行中...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              コードを実行
            </>
          )}
        </button>
        {!pyodide && <span className="text-sm text-gray-500">Python環境を読み込み中...</span>}
      </div>

      {/* 出力エリア */}
      {output && (
        <div className="bg-gray-900 text-white p-4 font-mono text-sm">
          <pre className="whitespace-pre-wrap">{output}</pre>
        </div>
      )}
    </div>
  )
}

export default function PracticeLearningContent({ topic, onClose }: PracticeLearningContentProps) {
  const [content, setContent] = useState<Content | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/practice-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic })
        })

        if (!response.ok) {
          throw new Error('コンテンツの取得に失敗しました')
        }

        const data = await response.json()
        
        // 返されたデータ構造を検証
        if (!data.title || !data.introduction || !Array.isArray(data.sections)) {
          throw new Error('返されたデータ形式が正しくありません')
        }

        // 各セクションの内容を検証
        data.sections.forEach((section: Section, index: number) => {
          if (!section.title || !section.content || !section.codeExample || !section.explanation) {
            throw new Error(`セクション ${index + 1} の内容が不完全です`)
          }
        })

        console.log('受信したコンテンツ:', data) // ログを追加
        setContent(data)
      } catch (err) {
        console.error('コンテンツの読み込みに失敗:', err)
        setError(err instanceof Error ? err.message : 'コンテンツの読み込みに失敗しました')
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [topic])

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
        <div className="absolute inset-y-0 right-0 w-2/3 bg-white shadow-lg">
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
        <div className="absolute inset-y-0 right-0 w-2/3 bg-white shadow-lg p-6">
          <div className="text-red-500 text-center">
            <p>{error}</p>
            <button 
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="absolute inset-y-0 right-0 w-2/3 bg-white shadow-lg overflow-auto">
        <div className="sticky top-0 bg-white border-b z-10">
          <div className="p-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold">{content?.title}</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {content && (
            <div className="space-y-8">
              {/* 概念の簡単な説明 */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800">{content.introduction}</p>
              </div>

              {/* コード例と説明 */}
              {content.sections.map((section, index) => (
                <div key={index} className="space-y-4 border-t pt-8 first:border-t-0 first:pt-0">
                  <h3 className="text-lg font-semibold text-gray-800">{section.title}</h3>
                  <p className="text-gray-600">{section.content}</p>
                  
                  <div className="relative">
                    <RunnableCodeBlock code={section.codeExample} />
                    <div className="absolute top-2 right-2 text-xs text-gray-500">
                      例 {index + 1}
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-gray-800">{section.explanation}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 