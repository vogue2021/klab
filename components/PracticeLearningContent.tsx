'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Play, Loader2 } from 'lucide-react'
import Editor from '@monaco-editor/react'

// 声明全局 Pyodide 类型
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

// 可运行代码块组件
function RunnableCodeBlock({ code: initialCode, height = "200px" }: CodeBlockProps) {
  const [code, setCode] = useState(initialCode)
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [pyodide, setPyodide] = useState<any>(null)
  const [inputValue, setInputValue] = useState('')
  const [waitingForInput, setWaitingForInput] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // 初始化 Pyodide
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

        // 初始化 Python 环境并设置模拟输入函数
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
              # 使用 JavaScript 的 prompt 函数获取输入
              result = prompt(prompt_text)
              if result is None:
                  raise EOFError("用户取消了输入")
              return result
          
          # 初始化标准输出和错误输出
          sys.stdout = CustomIO()
          sys.stderr = CustomIO()
          __builtins__.input = custom_input
        `)

        window.pyodide = pyodide
        setPyodide(pyodide)
      } catch (error) {
        console.error('Pyodide 初始化失败:', error)
      }
    }
    initPyodide()
  }, [])

  // 处理用户输入
  const handleInput = async (value: string) => {
    setWaitingForInput(false)
    setInputValue('')
    return value
  }

  // 运行代码
  const runCode = async () => {
    if (!pyodide || isRunning) return

    setIsRunning(true)
    setOutput('')

    try {
      // 重置输出缓冲区
      await pyodide.runPythonAsync(`
        sys.stdout = CustomIO()
        sys.stderr = CustomIO()
      `)

      // 设置全局 prompt 函数
      ;(globalThis as any).prompt = (text: string) => {
        setOutput(prev => prev + text)
        const value = window.prompt(text)
        if (value !== null) {
          setOutput(prev => prev + value + '\n')
        }
        return value
      }

      // 运行用户代码
      const wrappedCode = `
try:
    ${initialCode.split('\n').join('\n    ')}
except Exception as e:
    print(f"错误: {str(e)}")
`
      const result = await pyodide.runPythonAsync(wrappedCode)

      // 获取输出
      const stdout = await pyodide.runPythonAsync('sys.stdout.getvalue()')
      const stderr = await pyodide.runPythonAsync('sys.stderr.getvalue()')

      // 合并输出
      let output = ''
      if (stdout) output += stdout
      if (stderr) output += stderr
      if (result !== undefined && !stdout && !stderr) {
        output += String(result)
      }

      setOutput(prev => prev + (output || '代码执行成功，无输出'))
    } catch (error) {
      setOutput(`系统错误: ${error}`)
    } finally {
      setIsRunning(false)
      // 清理全局 prompt 函数
      delete (globalThis as any).prompt
    }
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* 代码编辑器 */}
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
            readOnly: isRunning, // 运行时禁止编辑
            debugger: {
              enabled: false
            },
            links: false,
            contextmenu: false
          }}
          beforeMount={(monaco) => {
            // 禁用一些不需要的功能
            monaco.editor.defineTheme('custom-dark', {
              base: 'vs-dark',
              inherit: true,
              rules: [],
              colors: {}
            })
          }}
        />
      </div>

      {/* 控制栏 */}
      <div className="bg-gray-100 px-4 py-2 flex justify-between items-center">
        <button
          onClick={runCode}
          disabled={isRunning || !pyodide}
          className="flex items-center gap-2 px-3 py-1.5 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
        {!pyodide && <span className="text-sm text-gray-500">正在加载 Python 环境...</span>}
      </div>

      {/* 输出区域 */}
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
          throw new Error('获取内容失败')
        }

        const data = await response.json()
        
        // 验证返回的数据结构
        if (!data.title || !data.introduction || !Array.isArray(data.sections)) {
          throw new Error('返回的数据格式不正确')
        }

        // 验证每个部分的内容
        data.sections.forEach((section: Section, index: number) => {
          if (!section.title || !section.content || !section.codeExample || !section.explanation) {
            throw new Error(`第 ${index + 1} 个示例的内容不完整`)
          }
        })

        console.log('Received content:', data) // 添加日志
        setContent(data)
      } catch (err) {
        console.error('加载内容失败:', err)
        setError(err instanceof Error ? err.message : '加载内容失败')
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
              关闭
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
              {/* 简短概念说明 */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800">{content.introduction}</p>
              </div>

              {/* 代码示例和讲解 */}
              {content.sections.map((section, index) => (
                <div key={index} className="space-y-4 border-t pt-8 first:border-t-0 first:pt-0">
                  <h3 className="text-lg font-semibold text-gray-800">{section.title}</h3>
                  <p className="text-gray-600">{section.content}</p>
                  
                  <div className="relative">
                    <RunnableCodeBlock code={section.codeExample} />
                    <div className="absolute top-2 right-2 text-xs text-gray-500">
                      示例 {index + 1}
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