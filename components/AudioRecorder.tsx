'use client'

import { useState, useRef } from 'react'
import { Mic, Square, Loader2 } from 'lucide-react'

interface AudioRecorderProps {
  onTranscription: (text: string) => void
}

export default function AudioRecorder({ onTranscription }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
        await processAudio(audioBlob)
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (err) {
      console.error('録音に失敗しました:', err)
      alert('マイクにアクセスできません')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      // すべての音声トラックを停止
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
    }
  }

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true)
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob)

      const response = await fetch('/api/speech-to-text', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('音声認識に失敗しました')
      }

      const data = await response.json()
      onTranscription(data.text)
    } catch (err) {
      console.error('音声の処理に失敗しました:', err)
      alert('音声認識に失敗しました')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="flex items-center gap-4">
      {isProcessing ? (
        <div className="flex items-center gap-2 text-blue-500">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>認識中...</span>
        </div>
      ) : isRecording ? (
        <button
          onClick={stopRecording}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          <Square className="w-4 h-4" />
          録音停止
        </button>
      ) : (
        <button
          onClick={startRecording}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <Mic className="w-4 h-4" />
          録音開始
        </button>
      )}
    </div>
  )
} 