'use client'

import { useState, useEffect } from 'react'
import { MessageCircle } from 'lucide-react'
import ChatWindow from './ChatWindow'

export default function FloatingButton() {
  const [selectedText, setSelectedText] = useState('')
  const [showButton, setShowButton] = useState(false)
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 })
  const [showChat, setShowChat] = useState(false)

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection()
      const text = selection?.toString().trim()

      if (text) {
        const range = selection?.getRangeAt(0)
        const rect = range?.getBoundingClientRect()

        if (rect) {
          setButtonPosition({
            x: rect.x + rect.width / 2,
            y: rect.y + window.scrollY - 30
          })
          setSelectedText(text)
          setShowButton(true)
        }
      } else {
        setShowButton(false)
      }
    }

    document.addEventListener('mouseup', handleSelection)
    return () => document.removeEventListener('mouseup', handleSelection)
  }, [])

  // 点击其他地方时隐藏按钮
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.floating-chat-button')) {
        setShowButton(false)
      }
    }

    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <>
      {showButton && (
        <button
          className="floating-chat-button fixed z-50 bg-blue-500 text-white rounded-full p-2 shadow-lg transform -translate-x-1/2 hover:bg-blue-600 transition-colors flex items-center gap-2"
          style={{
            left: buttonPosition.x,
            top: buttonPosition.y
          }}
          onClick={() => setShowChat(true)}
        >
          <MessageCircle className="w-4 h-4" />
          <span className="text-sm">Chat</span>
        </button>
      )}

      {showChat && (
        <ChatWindow
          initialQuestion={selectedText}
          onClose={() => {
            setShowChat(false)
            setShowButton(false)
          }}
        />
      )}
    </>
  )
} 