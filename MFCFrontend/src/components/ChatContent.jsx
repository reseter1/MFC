import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import { API_URL_GENAI } from "../data/constant"
import { useToast } from "./ToastProvider"
import { APP_NAME } from "../data/constant"
import React from "react"
import { Volume2 } from "lucide-react"
import { useSelector } from 'react-redux'
import { selectVoiceSettings } from '../store/slices/voiceSettingsSlice'
import NewChat from "./NewChat"

const ChatContent = ({ contextId, messages, setMessages, isLoadingBotResponse }) => {
  const { addToast } = useToast()
  const messagesEndRef = useRef(null)
  const voiceSettings = useSelector(selectVoiceSettings)
  const [isLoadingTTS, setIsLoadingTTS] = React.useState({})
  const [isLoadingMessages, setIsLoadingMessages] = useState(true)
  const [isRenderingMessages, setIsRenderingMessages] = useState(false)
  const prevContextIdRef = useRef(contextId)

  useEffect(() => {
    const fetchMessages = async () => {
      if (contextId !== prevContextIdRef.current || messages.length === 0) {
        setIsLoadingMessages(true)
        setIsRenderingMessages(true)
        try {
          const response = await fetch(`${API_URL_GENAI}/admin/get-messages`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contextId: contextId,
            }),
          })

          if (response.ok) {
            const result = await response.json()
            if (result.success) {
              const formattedMessages = result.data.map((msg) => ({
                id: msg.id,
                sender: msg.role === "user" ? "user" : "bot",
                content: msg.content,
              }))
              setMessages(formattedMessages)
              setTimeout(() => {
                setIsLoadingMessages(false)
                setTimeout(() => {
                  setIsRenderingMessages(false)
                }, 100)
              }, 300)
            }
          }
        } catch (error) {
          addToast("Lỗi khi lấy tin nhắn: " + error.message, "error")
          setIsLoadingMessages(false)
          setIsRenderingMessages(false)
        }
        prevContextIdRef.current = contextId
      }
    }

    if (contextId) {
      fetchMessages()
    } else {
      setMessages([])
      setIsLoadingMessages(false)
      setIsRenderingMessages(false)
    }
  }, [contextId, setMessages, addToast, messages.length])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoadingBotResponse, isRenderingMessages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleTextToSpeech = async (text, messageId) => {
    setIsLoadingTTS(prev => ({ ...prev, [messageId]: true }))
    try {
      const response = await fetch(`${API_URL_GENAI}/v2/ttsv2-gen`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
          voiceId: parseInt(voiceSettings.voice),
          speed: voiceSettings.speed,
          language: voiceSettings.language
        }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          const audio = new Audio(`${result.media_url}`)
          audio.play()
        } else {
          addToast(result.error || "Lỗi khi tạo giọng nói", "error")
        }
      } else {
        addToast("Lỗi khi gọi API chuyển đổi văn bản thành giọng nói", "error")
      }
    } catch (error) {
      addToast("Lỗi khi chuyển đổi văn bản thành giọng nói: " + error.message, "error")
    } finally {
      setIsLoadingTTS(prev => ({ ...prev, [messageId]: false }))
    }
  }

  // Custom renderer for code blocks with syntax highlighting
  const components = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "")
      return !inline && match ? (
        <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div" className="rounded-md my-2" {...props}>
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      ) : (
        <code className={`${className} bg-gray-200 px-1 py-0.5 rounded text-sm`} {...props}>
          {children}
        </code>
      )
    },
    // Custom styling for other markdown elements
    p: ({ children }) => <p className="mb-2">{children}</p>,
    h1: ({ children }) => <h1 className="text-2xl font-bold my-3">{children}</h1>,
    h2: ({ children }) => <h2 className="text-xl font-bold my-2">{children}</h2>,
    h3: ({ children }) => <h3 className="text-lg font-bold my-2">{children}</h3>,
    h4: ({ children }) => <h4 className="text-base font-bold my-1">{children}</h4>,
    ul: ({ children }) => <ul className="list-disc pl-5 my-2">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal pl-5 my-2">{children}</ol>,
    li: ({ children }) => <li className="mb-1">{children}</li>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-gray-300 pl-4 italic my-2">{children}</blockquote>
    ),
    a: ({ href, children }) => (
      <a href={href} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
    strong: ({ children }) => <strong className="font-bold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    table: ({ children }) => (
      <div className="overflow-x-auto my-4">
        <table className="min-w-full border border-gray-300">{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead className="bg-gray-100">{children}</thead>,
    tbody: ({ children }) => <tbody>{children}</tbody>,
    tr: ({ children }) => <tr className="border-b border-gray-300">{children}</tr>,
    th: ({ children }) => <th className="px-4 py-2 text-left font-semibold">{children}</th>,
    td: ({ children }) => <td className="px-4 py-2">{children}</td>,
  }

  return (
    <>
      {isLoadingMessages ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-500 border-l-transparent border-r-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg text-gray-700">Đang tải tin nhắn...</p>
          </motion.div>
        </div>
      ) : messages.length === 0 && !isLoadingBotResponse ? (
        <NewChat />
      ) : (
        <div className="flex-1 overflow-auto p-4">
          <div className="max-w-3xl mx-auto space-y-4 pb-16">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: message.id * 0.015 }}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-2xl p-4 rounded-lg ${message.sender === "user" ? "bg-gray-200 text-gray-900" : "bg-gray-100 text-gray-900"
                    }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center text-sm font-medium">
                      {message.sender === "user" ? (
                        "Bạn"
                      ) : (
                        <>
                          <div className="w-4 h-4 mr-2">
                            <img
                              src="https://openfxt.vercel.app/images/favicon.png"
                              alt="Logo"
                              className="w-full h-full object-contain"
                            />
                          </div>
                          {APP_NAME}
                        </>
                      )}
                    </div>
                    <motion.button
                      className="text-gray-500 hover:text-gray-700 focus:outline-none"
                      title="Đọc tin nhắn thành tiếng"
                      onClick={() => handleTextToSpeech(message.content, message.id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      disabled={isLoadingTTS[message.id]}
                    >
                      {isLoadingTTS[message.id] ? (
                        <div className="h-4 w-4 border-2 border-gray-700 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </motion.button>
                  </div>
                  <div className="markdown-content text-base">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={components}>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            ))}
            {isLoadingBotResponse && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="flex justify-start"
              >
                <div className="max-w-md p-3 rounded-lg bg-transparent text-gray-900 flex items-center">
                  <div className="w-4 h-4 mr-2">
                    <img
                      src="https://openfxt.vercel.app/images/favicon.png"
                      alt="Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-base text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-500 to-black animate-gradient-text">
                    {APP_NAME} thinking...
                  </p>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}
    </>
  )
}

export default ChatContent
