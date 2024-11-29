'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Send } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ChatWindowProps {
  initialQuestion: string
  onClose: () => void
}

export default function ChatWindow({ initialQuestion, onClose }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (initialQuestion) {
      handleSendMessage(initialQuestion)
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return

    // 立即添加用户消息
    setMessages(prev => [...prev, { role: 'user', content }])
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: content,
          history: messages // 发送对话历史以保持上下文
        })
      })

      if (!response.ok) {
        throw new Error('发送消息失败')
      }

      const data = await response.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '抱歉，处理您的问题时出现错误。请重试。' 
      }])
    } finally {
      setIsLoading(false)
      setInput('')
    }
  }

  const MessageContent = ({ content, role }: { content: string, role: 'user' | 'assistant' }) => (
    <div className={`max-w-[90%] rounded-lg p-3 ${
      role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100'
    }`}>
      {role === 'assistant' ? (
        <ReactMarkdown
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '')
              return !inline && match ? (
                <SyntaxHighlighter
                  language={match[1]}
                  style={vscDarkPlus}
                  PreTag="div"
                  className="rounded-md my-2"
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code className="bg-gray-800 text-white px-1 rounded" {...props}>
                  {children}
                </code>
              )
            },
            // 添加其他 Markdown 样式
            strong: (props) => <strong className="font-bold text-blue-600" {...props} />,
            em: (props) => <em className="italic text-purple-600" {...props} />,
            h1: (props) => <h1 className="text-xl font-bold my-2" {...props} />,
            h2: (props) => <h2 className="text-lg font-bold my-2" {...props} />,
            ul: (props) => <ul className="list-disc ml-4 my-2" {...props} />,
            ol: (props) => <ol className="list-decimal ml-4 my-2" {...props} />,
            blockquote: (props) => (
              <blockquote className="border-l-4 border-gray-300 pl-4 my-2 italic" {...props} />
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      ) : (
        <div className="whitespace-pre-wrap">{content}</div>
      )}
    </div>
  )

  return (
    <div className="fixed bottom-4 right-4 w-[450px] h-[600px] bg-white rounded-lg shadow-xl border flex flex-col z-50">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
        <h3 className="font-medium">AI 助手</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-200 rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <MessageContent content={message.content} role={message.role} />
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4 bg-gray-50">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage(input)
              }
            }}
            placeholder="输入问题..."
            className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => handleSendMessage(input)}
            disabled={isLoading || !input.trim()}
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
} 