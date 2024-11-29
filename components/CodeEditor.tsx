'use client'

import { useState, useEffect } from 'react'

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
}

export default function CodeEditor({ value, onChange }: CodeEditorProps) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    console.log('Code changed:', newValue)
    onChange(newValue)
  }

  return (
    <div className="flex flex-col h-full">
      <textarea
        value={value}
        onChange={handleChange}
        className="flex-1 p-4 font-mono text-sm border rounded-lg"
        placeholder="在这里输入Python代码..."
      />
    </div>
  )
} 