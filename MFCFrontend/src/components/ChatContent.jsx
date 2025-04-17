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

/* Thêm vào đầu file hoặc trong thẻ <style jsx global> nếu dùng Next.js */
const shimmerStyle = `
  .shimmer {
    position: relative;
    overflow: hidden;
    background: #e0e0e0;
  }
  .shimmer-bg {
    pointer-events: none;
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg,rgba(255,255,255,0) 0%,rgba(255,255,255,0.3) 50%,rgba(255,255,255,0) 100%);
    animation: shimmer-move 1.5s infinite;
    z-index: 1;
  }
  @keyframes shimmer-move {
    0% { transform: translateX(-100%);}
    100% { transform: translateX(100%);}
  }
`

const skeletonBubbleVariants = {
  initial: { opacity: 0, y: 20 },
  animate: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5, type: "spring" }
  })
}

function ChatSkeleton({ align = "left", index }) {
  return (
    <motion.div
      custom={index}
      variants={skeletonBubbleVariants}
      initial="initial"
      animate="animate"
      className={`flex ${align === "right" ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`relative max-w-2xl p-4 rounded-lg mb-2
          ${align === "right" ? "bg-gray-200" : "bg-gray-100"}
          overflow-hidden w-[70%] min-h-[56px]`}
      >
        <div className="flex items-center mb-2">
          <div className="h-4 w-20 bg-gray-300 rounded mr-2 shimmer" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-3/4 bg-gray-300 rounded shimmer" />
          <div className="h-4 w-2/4 bg-gray-300 rounded shimmer" />
          <div className="h-4 w-1/2 bg-gray-300 rounded shimmer" />
        </div>
        <div className="absolute inset-0 shimmer-bg" />
      </div>
    </motion.div>
  )
}

const ChatContent = ({ contextId, messages, setMessages, isLoadingBotResponse }) => {
  const { addToast } = useToast()
  const messagesEndRef = useRef(null)
  const voiceSettings = useSelector(selectVoiceSettings)
  const [isLoadingTTS, setIsLoadingTTS] = React.useState({})
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isRenderingMessages, setIsRenderingMessages] = useState(false)
  const prevContextIdRef = useRef(null)

  useEffect(() => {
    const fetchMessages = async () => {
      if (contextId && contextId !== "null") {
        if (prevContextIdRef.current !== contextId) {
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
              } else {
                setMessages([])
                setIsLoadingMessages(false)
                setIsRenderingMessages(false)
              }
            } else {
              setMessages([])
              setIsLoadingMessages(false)
              setIsRenderingMessages(false)
            }
          } catch (error) {
            addToast("Lỗi khi lấy tin nhắn: " + error.message, "error")
            setMessages([])
            setIsLoadingMessages(false)
            setIsRenderingMessages(false)
          }
          prevContextIdRef.current = contextId
        }
      } else {
        setMessages([])
        setIsLoadingMessages(false)
        setIsRenderingMessages(false)
      }
    }

    fetchMessages()
  }, [contextId, setMessages, addToast])

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
      <style>{shimmerStyle}</style>
      {isLoadingMessages ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl mx-auto space-y-4 pb-16">
            {[0, 1, 2].map((i) => (
              <ChatSkeleton key={i} align={i % 2 === 0 ? "left" : "right"} index={i} />
            ))}
            <div className="flex justify-center mt-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                className="text-center"
              >
                <div className="w-10 h-10 border-4 border-t-blue-500 border-b-blue-500 border-l-transparent border-r-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-base text-gray-500">Đang tải tin nhắn...</p>
              </motion.div>
            </div>
          </div>
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
