"use client"

import React, { useState, useEffect, useRef } from "react"
import ReactMarkdown from "react-markdown";


import { MessageSquare, Mic, X, Send, Sparkles } from "lucide-react"
import { GoogleGenerativeAI } from "@google/generative-ai"

interface VoiceChatbotProps {
  onClose: () => void
  onEarnPoints: (points: number) => void
  apiKey?: string
}

function VoiceChatbot({ onClose, onEarnPoints, apiKey }: VoiceChatbotProps) {
  // Initialize the Google Generative AI model
  const genAIRef = useRef<any>(null)
  const modelRef = useRef<any>(null)

  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean }>>([
    {
      text: "Hey there, young explorer! 🌟 I'm your JeevanPath buddy! Ready to go on an awesome learning adventure together? Tell me what you'd like to discover today!",
      isUser: false,
    },
  ])
  const [isListening, setIsListening] = useState(false)
  const [inputText, setInputText] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [voiceVisualization, setVoiceVisualization] = useState<number[]>(Array(20).fill(0))
  const [micPermissionError, setMicPermissionError] = useState<string | null>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const recognition = useRef<any>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number>()
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    if (apiKey) {
      try {
        genAIRef.current = new GoogleGenerativeAI(apiKey)
        modelRef.current = genAIRef.current.getGenerativeModel({ model: "gemini-1.0-pro" })
      } catch (error) {
        console.error("Error initializing AI model:", error)
      }
    }
  }, [apiKey])

  // Initialize speech recognition
  useEffect(() => {
    if (window.SpeechRecognition || (window as any).webkitSpeechRecognition) {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition
      recognition.current = new SpeechRecognition()
      recognition.current.continuous = true
      recognition.current.interimResults = true

      recognition.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result) => result.transcript)
          .join("")
        setInputText(transcript)
      }

      recognition.current.onend = () => {
        setIsListening(false)
        stopVisualization()
      }

      // Check initial microphone permission
      checkMicrophonePermission()
    }

    return () => {
      stopVisualization()
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  // Check microphone permissions
  const checkMicrophonePermission = async () => {
    try {
      const permissionStatus = await navigator.permissions.query({ name: "microphone" as PermissionName })

      if (permissionStatus.state === "denied") {
        setMicPermissionError(
          "Microphone access is blocked. Please enable it in your browser settings and refresh the page.",
        )
        return false
      }

      if (permissionStatus.state === "prompt") {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
          stream.getTracks().forEach((track) => track.stop())
          setMicPermissionError(null)
          return true
        } catch (error) {
          setMicPermissionError("Please allow microphone access to use voice features.")
          return false
        }
      }

      setMicPermissionError(null)
      return true
    } catch (error) {
      console.error("Error checking microphone permission:", error)
      setMicPermissionError(
        "Unable to check microphone permissions. Please ensure your browser supports microphone access.",
      )
      return false
    }
  }

  // Start audio visualization
  const startVisualization = async () => {
    try {
      const hasPermission = await checkMicrophonePermission()
      if (!hasPermission) {
        return
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const audioContext = new AudioContext()
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 64
      analyserRef.current = analyser
      source.connect(analyser)

      const updateVisualization = () => {
        const dataArray = new Uint8Array(analyser.frequencyBinCount)
        analyser.getByteFrequencyData(dataArray)

        const normalizedData = Array.from(dataArray)
          .slice(0, 20)
          .map((value) => value / 255)

        setVoiceVisualization(normalizedData)
        animationFrameRef.current = requestAnimationFrame(updateVisualization)
      }

      updateVisualization()
    } catch (error) {
      console.error("Error accessing microphone:", error)
      setMicPermissionError("Unable to access microphone. Please check your browser settings.")
      setIsListening(false)
    }
  }

  // Stop audio visualization
  const stopVisualization = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setVoiceVisualization(Array(20).fill(0))
  }

  // Auto-scroll chat to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  // Toggle voice listening
  const toggleListening = async () => {
    if (isListening) {
      recognition.current?.stop()
      stopVisualization()
      setIsListening(false)
    } else {
      const hasPermission = await checkMicrophonePermission()
      if (hasPermission) {
        try {
          recognition.current?.start()
          await startVisualization()
          setIsListening(true)
        } catch (error) {
          console.error("Error starting voice recognition:", error)
          setMicPermissionError("Failed to start voice recognition. Please try again.")
          setIsListening(false)
        }
      }
    }
  }

  // Generate AI response
  const generateAIResponse = async (userMessage: string) => {
    try {
      setIsTyping(true);

      const response = await fetch("http://localhost:3000/generate-response", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userMessage }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await response.json();
      const aiResponse = formatAIResponse(data.response);

      setMessages((prev) => [...prev, { text: aiResponse, isUser: false }]);
      onEarnPoints(10);
    } catch (error) {
      console.error("Error generating AI response:", error);
      setMessages((prev) => [
        ...prev,
        {
          text: "Oops! I hit a small bump there! Let's try that question again, shall we?",
          isUser: false,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Format AI response
  const formatAIResponse = (response: string) => {
    return `${response.toString()}`;
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return

    setMessages((prev) => [...prev, { text, isUser: true }])
    setInputText("")
    await generateAIResponse(text)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage(inputText)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
      <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-[800px] h-[600px] flex flex-col m-4 border border-purple-500">
        <div className="flex items-center justify-between bg-gradient-to-r from-purple-600 to-indigo-600 p-4 rounded-t-lg">
          <div className="flex items-center text-white">
            <MessageSquare className="w-6 h-6 mr-2" />
            <span className="font-semibold text-lg">Jeevanpath Buddy</span>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
            aria-label="Close chatbot"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Voice Visualization */}
        <div className="h-16 bg-gray-800 flex items-center justify-center gap-1 px-4">
          {micPermissionError ? (
            <div className="text-red-400 text-sm text-center px-4">{micPermissionError}</div>
          ) : (
            voiceVisualization.map((value, index) => (
              <div
                key={index}
                className="w-2 bg-purple-500 rounded-full transition-all duration-100"
                style={{
                  height: `${Math.max(4, value * 100)}%`,
                  opacity: isListening ? 0.7 + value * 0.3 : 0.3,
                }}
              />
            ))
          )}
        </div>

        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-900">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[70%] p-4 rounded-2xl ${message.isUser ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-200"
                  } shadow-lg`}>
                <ReactMarkdown
                  components={{
                    strong: ({ node, ...props }) => <strong className="text-yellow-200" {...props} />,
                    em: ({ node, ...props }) => <em className="italic text-blue-300" {...props} />,
                    li: ({ node, ...props }) => <li className="ml-4 list-disc text-white" {...props} />,
                  }}
                >
                  {message.text}
                </ReactMarkdown>
                {!message.isUser && index > 0 && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                    <Sparkles className="w-3 h-3" />
                    <span>+10 points</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-800 text-gray-200 p-4 rounded-2xl">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-700 bg-gray-800">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message or click the mic to speak..."
              className="flex-1 p-3 border rounded-xl focus:outline-none focus:border-purple-500 bg-gray-700 text-white placeholder-gray-400 border-gray-600"
              onKeyPress={handleKeyPress}
              aria-label="Message input"
            />
            <button
              className={`p-3 rounded-xl ${isListening ? "bg-red-500" : "bg-purple-500"
                } text-white hover:opacity-90 transition-opacity`}
              onClick={toggleListening}
              disabled={!!micPermissionError}
              aria-label={isListening ? "Stop listening" : "Start listening"}
            >
              <Mic className="w-5 h-5" />
            </button>
            <button
              className="p-3 rounded-xl bg-purple-500 text-white hover:opacity-90 transition-opacity"
              onClick={() => handleSendMessage(inputText)}
              aria-label="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VoiceChatbot;