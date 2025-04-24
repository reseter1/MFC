import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { motion, useScroll, useTransform, useAnimation, useInView, AnimatePresence } from "framer-motion"
import { APP_NAME, APP_VERSION } from "../data/constant"
import {
    ArrowRight,
    MessageSquare,
    Users,
    FileText,
    Headphones,
    Sparkles,
    Github,
    ThumbsUp,
    ZoomIn,
    Award,
} from "lucide-react"
import AppImage from "../assets/image.png"

function useMousePosition() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

    useEffect(() => {
        const updateMousePosition = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY })
        }

        window.addEventListener("mousemove", updateMousePosition)

        return () => {
            window.removeEventListener("mousemove", updateMousePosition)
        }
    }, [])

    return mousePosition
}

function ParticlesBackground() {
    const particlesRef = useRef(null)

    useEffect(() => {
        const particles = []
        const colors = ["#8b5cf6", "#6366f1", "#ec4899", "#3b82f6"]
        const canvas = particlesRef.current
        const ctx = canvas.getContext("2d")
        let animationFrameId
        let width, height
        let lastTime = 0
        const FPS = 30 // Limit to 30 FPS for better performance
        const fpsInterval = 1000 / FPS

        const resizeCanvas = () => {
            width = window.innerWidth
            height = window.innerHeight
            canvas.width = width
            canvas.height = height

            // Reduce number of particles for better performance
            const particleCount = Math.min(Math.floor(width / 40), 30)

            // Reinitialize particles when resizing
            particles.length = 0
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    size: Math.random() * 2 + 0.5,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    speedX: Math.random() * 0.2 - 0.1, // Reduced speed
                    speedY: Math.random() * 0.2 - 0.1, // Reduced speed
                    opacity: Math.random() * 0.3 + 0.1,
                })
            }
        }

        const animate = (timestamp) => {
            const elapsed = timestamp - lastTime

            if (elapsed > fpsInterval) {
                lastTime = timestamp - (elapsed % fpsInterval)

                ctx.clearRect(0, 0, width, height)

                for (let i = 0; i < particles.length; i++) {
                    const p = particles[i]

                    // Draw particle
                    ctx.globalAlpha = p.opacity
                    ctx.fillStyle = p.color
                    ctx.beginPath()
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
                    ctx.fill()

                    // Update position
                    p.x += p.speedX
                    p.y += p.speedY

                    // Reset particle if it goes off screen
                    if (p.x < 0 || p.x > width) p.speedX *= -1
                    if (p.y < 0 || p.y > height) p.speedY *= -1
                }
            }

            animationFrameId = requestAnimationFrame(animate)
        }

        resizeCanvas()
        animate(0)

        // Debounce resize event for better performance
        let resizeTimeout
        const handleResize = () => {
            clearTimeout(resizeTimeout)
            resizeTimeout = setTimeout(resizeCanvas, 200)
        }

        window.addEventListener("resize", handleResize)

        return () => {
            window.removeEventListener("resize", handleResize)
            cancelAnimationFrame(animationFrameId)
        }
    }, [])

    return <canvas ref={particlesRef} className="absolute inset-0 z-0 opacity-20" style={{ pointerEvents: "none" }} />
}

const TextAnimation = ({ text, className }) => {
    const letters = Array.from(text)

    const container = {
        hidden: { opacity: 0 },
        visible: (i = 1) => ({
            opacity: 1,
            transition: { staggerChildren: 0.03, delayChildren: 0.04 * i },
        }),
    }

    const child = {
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 100,
            },
        },
        hidden: {
            opacity: 0,
            y: 20,
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 100,
            },
        },
    }

    return (
        <motion.div className={className} variants={container} initial="hidden" animate="visible">
            {letters.map((letter, index) => (
                <motion.span key={index} variants={child} className={letter === " " ? "mr-2" : ""}>
                    {letter === " " ? "\u00A0" : letter}
                </motion.span>
            ))}
        </motion.div>
    )
}

const FloatingElement = ({ children, intensity = 20, speed = 4 }) => {
    return (
        <motion.div
            animate={{
                y: [intensity * -0.5, intensity * 0.5, intensity * -0.5],
            }}
            transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: speed,
                ease: "easeInOut",
            }}
        >
            {children}
        </motion.div>
    )
}

const StatsCounter = ({ from, to, duration, suffix = "", className = "", children }) => {
    const nodeRef = useRef(null)
    const isInView = useInView(nodeRef, { once: true })
    const [count, setCount] = useState(from)

    useEffect(() => {
        if (isInView) {
            let startTime
            let animationFrame

            const updateCount = (timestamp) => {
                if (!startTime) startTime = timestamp
                const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)
                const currentCount = Math.floor(progress * (to - from) + from)

                setCount(currentCount)

                if (progress < 1) {
                    animationFrame = requestAnimationFrame(updateCount)
                }
            }

            animationFrame = requestAnimationFrame(updateCount)

            return () => cancelAnimationFrame(animationFrame)
        }
    }, [from, to, duration, isInView])

    return (
        <div ref={nodeRef} className={className}>
            <div className="text-4xl font-bold text-indigo-600 mb-2 flex items-center justify-center">
                <motion.span
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0.5, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                >
                    {count}
                </motion.span>
                <span className="text-gray-900">{suffix}</span>
            </div>
            {children}
        </div>
    )
}

const TiltCard = ({ children, className, intensity = 15 }) => {
    return <div className={`transform-gpu ${className}`}>{children}</div>
}

const TypeWriter = ({ texts, delay = 100, pauseTime = 2000, className }) => {
    const [currentTextIndex, setCurrentTextIndex] = useState(0)
    const [currentText, setCurrentText] = useState("")
    const [isDeleting, setIsDeleting] = useState(false)
    const [isPaused, setIsPaused] = useState(false)

    useEffect(() => {
        let timeout

        if (isPaused) {
            timeout = setTimeout(() => {
                setIsPaused(false)
                setIsDeleting(true)
            }, pauseTime)
            return () => clearTimeout(timeout)
        }

        const text = texts[currentTextIndex]

        if (isDeleting) {
            if (currentText.length === 0) {
                setIsDeleting(false)
                setCurrentTextIndex((currentTextIndex + 1) % texts.length)
            } else {
                timeout = setTimeout(() => {
                    setCurrentText((prev) => prev.slice(0, -1))
                }, delay / 2)
            }
        } else {
            if (currentText.length === text.length) {
                setIsPaused(true)
            } else {
                timeout = setTimeout(() => {
                    setCurrentText(text.slice(0, currentText.length + 1))
                }, delay)
            }
        }

        return () => clearTimeout(timeout)
    }, [currentText, currentTextIndex, delay, isDeleting, isPaused, pauseTime, texts])

    return (
        <div className={`relative ${className}`}>
            <span className="font-bold text-shadow-sm">{currentText}</span>
            <span className="absolute right-[-4px] top-0 w-0.5 h-full bg-current animate-pulse"></span>
        </div>
    )
}

const Marquee = ({ items, speed = 50, reverse = false, className = "" }) => {
    return (
        <div className={`overflow-hidden whitespace-nowrap ${className}`}>
            <div
                className="inline-block animate-marquee"
                style={{
                    animation: `marquee ${speed}s linear infinite ${reverse ? "reverse" : ""}`,
                    display: "inline-flex",
                    willChange: "transform",
                }}
            >
                {items.map((item, index) => (
                    <div key={index} className="inline-flex mx-8 items-center justify-center" style={{ minWidth: "200px" }}>
                        {item}
                    </div>
                ))}
                {/* Duplicate items for seamless looping */}
                {items.map((item, index) => (
                    <div
                        key={`duplicate-${index}`}
                        className="inline-flex mx-8 items-center justify-center"
                        style={{ minWidth: "200px" }}
                    >
                        {item}
                    </div>
                ))}
            </div>
        </div>
    )
}

const ScrollReveal = ({ children, delay = 0, direction = "left", className = "" }) => {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, amount: 0.3 })

    const getInitialClipPath = () => {
        switch (direction) {
            case "left":
                return "inset(0 100% 0 0)"
            case "right":
                return "inset(0 0 0 100%)"
            case "top":
                return "inset(100% 0 0 0)"
            case "bottom":
                return "inset(0 0 100% 0)"
            default:
                return "inset(0 100% 0 0)"
        }
    }

    return (
        <div ref={ref} className={`relative overflow-hidden ${className}`}>
            <motion.div
                initial={{ clipPath: getInitialClipPath() }}
                animate={isInView ? { clipPath: "inset(0 0 0 0)" } : { clipPath: getInitialClipPath() }}
                transition={{ duration: 0.8, delay, ease: "easeInOut" }}
            >
                {children}
            </motion.div>
        </div>
    )
}

const MagneticButton = ({ children, className, magneticIntensity = 0.3, scale = 1.1 }) => {
    const buttonRef = useRef(null)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [isHovered, setIsHovered] = useState(false)

    const handleMouseMove = (e) => {
        if (!buttonRef.current) return

        const rect = buttonRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left - rect.width / 2
        const y = e.clientY - rect.top - rect.height / 2

        setPosition({ x, y })
    }

    const handleMouseEnter = () => {
        setIsHovered(true)
    }

    const handleMouseLeave = () => {
        setIsHovered(false)
        setPosition({ x: 0, y: 0 })
    }

    const { x, y } = position

    return (
        <motion.div
            ref={buttonRef}
            className={`inline-block ${className}`}
            animate={{
                x: isHovered ? x * magneticIntensity : 0,
                y: isHovered ? y * magneticIntensity : 0,
                scale: isHovered ? scale : 1,
            }}
            transition={{
                type: "spring",
                stiffness: 150,
                damping: 15,
                mass: 0.1,
            }}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {children}
        </motion.div>
    )
}

const ParallaxCards = () => {
    const cards = [
        {
            title: "AI Chat",
            description: "Trò chuyện với AI thông minh nhất hiện nay",
            color: "from-blue-500 to-indigo-600",
            icon: <MessageSquare className="w-8 h-8 text-white" />,
        },
        {
            title: "File Analysis",
            description: "Phân tích file thông minh, trích xuất thông tin chính xác",
            color: "from-purple-500 to-pink-600",
            icon: <FileText className="w-8 h-8 text-white" />,
        },
        {
            title: "Voice Synthesis",
            description: "Chuyển đổi văn bản thành giọng nói tự nhiên",
            color: "from-emerald-500 to-teal-600",
            icon: <Headphones className="w-8 h-8 text-white" />,
        },
    ]

    return (
        <div className="hidden md:flex flex-col md:flex-row gap-6 lg:gap-10 py-12 justify-center items-center md:items-start">
            {cards.map((card, index) => (
                <div
                    key={index}
                    className={`relative w-72 rounded-xl overflow-hidden shadow-lg bg-gradient-to-br ${card.color}`}
                >
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="relative p-6 text-white z-10">
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-4">{card.icon}</div>
                        <h3 className="text-xl font-bold mb-2">{card.title}</h3>
                        <p className="text-white/80">{card.description}</p>
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full transform translate-x-16 -translate-y-16 z-0" />
                    <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full transform -translate-x-10 translate-y-10 z-0" />
                </div>
            ))}
        </div>
    )
}

const AIModelsSection = () => {
    const models = [
        {
            name: "MFC Plus",
            value: "null-flash",
            description: "Hiệu quả cho các tác vụ suy luận ở mức trung bình, tốc độ cao",
        },
        {
            name: "MFC Pro",
            value: "null-pro",
            description: "Hiệu quả cho các tác vụ suy luận ở mức cao, tốc độ trung bình",
        },
        {
            name: "MFC Base",
            value: "null-base",
            description: "Hiệu quả cho các tác vụ suy luận ở mức thấp, tốc độ cao nhất trong các mô hình",
        },
    ]

    return (
        <section className="hidden md:block py-16 bg-white relative overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto text-center mb-12">
                    <motion.h2
                        className="text-3xl font-bold text-gray-900 mb-4"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                    >
                        Mô hình AI tiên tiến
                    </motion.h2>
                    <motion.p
                        className="text-lg text-gray-600"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        viewport={{ once: true }}
                    >
                        Lựa chọn mô hình phù hợp với nhu cầu của bạn
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {models.map((model, index) => (
                        <motion.div
                            key={model.value}
                            className="relative bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -5 }}
                        >
                            <div
                                className={`h-2 ${model.name === "MFC Plus"
                                        ? "bg-indigo-500"
                                        : model.name === "MFC Pro"
                                            ? "bg-purple-500"
                                            : "bg-blue-500"
                                    }`}
                            />
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold text-gray-900">{model.name}</h3>
                                    <div
                                        className={`px-3 py-1 text-xs rounded-full ${model.name === "MFC Plus"
                                                ? "bg-indigo-100 text-indigo-700"
                                                : model.name === "MFC Pro"
                                                    ? "bg-purple-100 text-purple-700"
                                                    : "bg-blue-100 text-blue-700"
                                            }`}
                                    >
                                        {model.name === "MFC Plus" ? "Phổ biến" : model.name === "MFC Pro" ? "Cao cấp" : "Cơ bản"}
                                    </div>
                                </div>
                                <p className="text-gray-600 mb-6">{model.description}</p>
                                <div className="space-y-3">
                                    <div className="flex items-center">
                                        <div
                                            className={`w-4 h-4 rounded-full mr-2 ${model.name === "MFC Plus"
                                                    ? "bg-indigo-200"
                                                    : model.name === "MFC Pro"
                                                        ? "bg-purple-200"
                                                        : "bg-blue-200"
                                                }`}
                                        >
                                            <div
                                                className={`w-2 h-2 rounded-full mx-auto mt-1 ${model.name === "MFC Plus"
                                                        ? "bg-indigo-500"
                                                        : model.name === "MFC Pro"
                                                            ? "bg-purple-500"
                                                            : "bg-blue-500"
                                                    }`}
                                            />
                                        </div>
                                        <span className="text-sm text-gray-600">
                                            {model.name === "MFC Plus"
                                                ? "Tốc độ xử lý nhanh"
                                                : model.name === "MFC Pro"
                                                    ? "Độ chính xác cao"
                                                    : "Tiết kiệm tài nguyên"}
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <div
                                            className={`w-4 h-4 rounded-full mr-2 ${model.name === "MFC Plus"
                                                    ? "bg-indigo-200"
                                                    : model.name === "MFC Pro"
                                                        ? "bg-purple-200"
                                                        : "bg-blue-200"
                                                }`}
                                        >
                                            <div
                                                className={`w-2 h-2 rounded-full mx-auto mt-1 ${model.name === "MFC Plus"
                                                        ? "bg-indigo-500"
                                                        : model.name === "MFC Pro"
                                                            ? "bg-purple-500"
                                                            : "bg-blue-500"
                                                    }`}
                                            />
                                        </div>
                                        <span className="text-sm text-gray-600">
                                            {model.name === "MFC Plus"
                                                ? "Phù hợp cho đa số người dùng"
                                                : model.name === "MFC Pro"
                                                    ? "Dành cho các tác vụ phức tạp"
                                                    : "Lý tưởng cho người mới bắt đầu"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

const CountdownTimer = ({ targetDate, className }) => {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    })

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = +new Date(targetDate) - +new Date()
            let timeLeft = {
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0,
            }

            if (difference > 0) {
                timeLeft = {
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                }
            }

            return timeLeft
        }

        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft())
        }, 1000)

        // Initial calculation
        setTimeLeft(calculateTimeLeft())

        return () => clearTimeout(timer)
    }, [targetDate])

    const timeBlocks = [
        { label: "Ngày", value: timeLeft.days },
        { label: "Giờ", value: timeLeft.hours },
        { label: "Phút", value: timeLeft.minutes },
        { label: "Giây", value: timeLeft.seconds },
    ]

    return (
        <div className={`flex justify-center gap-4 ${className}`}>
            {timeBlocks.map((block, index) => (
                <div key={index} className="flex flex-col items-center">
                    <motion.div
                        className="bg-white w-16 h-16 md:w-20 md:h-20 rounded-lg shadow-md flex items-center justify-center font-mono relative overflow-hidden"
                        style={{ boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)" }}
                    >
                        <AnimatePresence mode="popLayout">
                            <motion.span
                                key={block.value}
                                initial={{ y: -40, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 40, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 200, damping: 30 }}
                                className="text-2xl md:text-3xl font-bold text-gray-800"
                            >
                                {(block.value || 0).toString().padStart(2, "0")}
                            </motion.span>
                        </AnimatePresence>

                        {/* Hiệu ứng phản chiếu */}
                        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/60 to-transparent pointer-events-none"></div>
                    </motion.div>
                    <span className="text-xs mt-2 text-gray-600">{block.label}</span>
                </div>
            ))}
        </div>
    )
}

const Scene3D = () => {
    return (
        <div className="hidden md:flex w-full h-[500px] relative items-center justify-center">
            <div className="text-center p-8 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl">
                <img src="https://openfxt.vercel.app/images/favicon.png" alt="MFC Logo" className="w-16 h-16 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-indigo-900 mb-2">Sản phẩm mới sắp ra mắt</h3>
                <p className="text-gray-600 mb-4">Phiên bản MFC Pro đang được phát triển</p>
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg shadow-lg">Đăng ký ưu tiên</button>
            </div>
        </div>
    )
}

export default function Landing() {
    const navigate = useNavigate()
    const [isScrolled, setIsScrolled] = useState(false)
    const { scrollYProgress } = useScroll()
    const opacity = useTransform(scrollYProgress, [0.3, 0.5], [1, 0])
    const scale = useTransform(scrollYProgress, [0.3, 0.5], [1, 0.9])

    // Intersection observer for elements
    const featuresRef = useRef(null)
    const isInView = useInView(featuresRef, { once: false, amount: 0.2 })
    const featuresAnimation = useAnimation()

    useEffect(() => {
        if (isInView) {
            featuresAnimation.start({
                y: 0,
                opacity: 1,
                transition: {
                    type: "spring",
                    stiffness: 50,
                    damping: 20,
                },
            })
        } else {
            featuresAnimation.start({
                y: 50,
                opacity: 0,
            })
        }
    }, [isInView, featuresAnimation])

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const features = [
        {
            icon: <MessageSquare className="w-6 h-6 text-indigo-500" />,
            title: "Trò chuyện thời gian thực",
            description: "Giao diện chat mượt mà với phản hồi tức thì từ AI tiên tiến",
        },
        {
            icon: <Sparkles className="w-6 h-6 text-purple-500" />,
            title: "Đa dạng mô hình AI",
            description: "Tự do lựa chọn giữa nhiều mô hình AI khác nhau cho trải nghiệm tốt nhất",
        },
        {
            icon: <FileText className="w-6 h-6 text-blue-500" />,
            title: "Phân tích file thông minh",
            description: "Tải lên và phân tích file tự động trong trò chuyện",
        },
        {
            icon: <Headphones className="w-6 h-6 text-emerald-500" />,
            title: "Text-to-Speech",
            description: "Chuyển đổi phản hồi AI thành giọng nói với nhiều tùy chọn",
        },
        {
            icon: <Users className="w-6 h-6 text-amber-500" />,
            title: "Thiết kế giao diện hiện đại",
            description: "Trải nghiệm người dùng đẹp mắt và thân thiện trên mọi thiết bị",
        },
        {
            icon: <Github className="w-6 h-6 text-gray-700" />,
            title: "Mã nguồn mở",
            description: "Dự án được phát triển với cộng đồng, cho cộng đồng",
        },
    ]

    const testimonials = [
        {
            name: "Nguyễn Văn Xạo",
            role: "Nhà phát triển phần mềm",
            content:
                "MFC đã thay đổi cách tôi tương tác với AI. Giao diện trực quan và khả năng phân tích file giúp công việc của tôi hiệu quả hơn rất nhiều.",
            avatar: "https://i.pravatar.cc/100?img=1",
        },
        {
            name: "Trần Thị Nổ",
            role: "Nhà nghiên cứu",
            content:
                "Tôi đặc biệt ấn tượng với khả năng tích hợp nhiều mô hình AI khác nhau. MFC giúp tôi thử nghiệm và so sánh kết quả một cách dễ dàng.",
            avatar: "https://i.pravatar.cc/100?img=2",
        },
        {
            name: "Lê Văn Thất Nghiệp",
            role: "Sinh viên",
            content:
                "Tính năng Text-to-Speech là một công cụ tuyệt vời cho việc học tập. Tôi có thể nghe giải thích thay vì đọc, giúp tôi hiểu bài nhanh hơn.",
            avatar: "https://i.pravatar.cc/100?img=3",
        },
    ]

    // Thêm texts cho TypeWriter
    const heroTexts = ["trải nghiệm AI tiên tiến", "tính năng thông minh", "giao diện hiện đại", "đa chức năng vượt trội"]

    // Thêm items cho Marquee
    const logoItems = [
        <div className="flex items-center">
            <ThumbsUp className="w-6 h-6 text-indigo-500 mr-2" />
            <span className="font-semibold">Siêu thông minh</span>
        </div>,
        <div className="flex items-center">
            <ZoomIn className="w-6 h-6 text-amber-500 mr-2" />
            <span className="font-semibold">Giao diện hiện đại</span>
        </div>,
        <div className="flex items-center">
            <Award className="w-6 h-6 text-emerald-500 mr-2" />
            <span className="font-semibold">Đầy đủ tính năng</span>
        </div>,
        <div className="flex items-center">
            <MessageSquare className="w-6 h-6 text-blue-500 mr-2" />
            <span className="font-semibold">Trò chuyện mượt mà</span>
        </div>,
        <div className="flex items-center">
            <Sparkles className="w-6 h-6 text-purple-500 mr-2" />
            <span className="font-semibold">AI tiên tiến</span>
        </div>,
    ]

    return (
        <div className="relative min-h-screen bg-white overflow-hidden">
            {/* Particles Background */}
            <ParticlesBackground />

            {/* Navbar */}
            <header
                className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? "bg-white/90 backdrop-blur-md shadow-md py-2" : "bg-transparent py-4"}`}
            >
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <motion.div
                        className="flex items-center"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <img src="https://openfxt.vercel.app/images/favicon.png" alt="Logo" className="h-8 w-8 mr-2" />
                        <h1 className="text-xl font-bold text-gray-900">{APP_NAME}</h1>
                        <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-md">v{APP_VERSION}</span>
                    </motion.div>
                    <motion.div
                        className="flex items-center space-x-2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <button
                            onClick={() => navigate("/sign-in")}
                            className="px-3 py-1.5 text-sm text-gray-700 hover:text-black transition-colors duration-200"
                        >
                            Đăng nhập
                        </button>
                        <button
                            onClick={() => navigate("/sign-up")}
                            className="px-4 py-1.5 text-sm bg-black text-white rounded-md hover:opacity-90 transition-all duration-200"
                        >
                            Đăng ký ngay
                        </button>
                    </motion.div>
                </div>
            </header>

            {/* Hero Section with enhanced animations */}
            <section className="relative pt-24 pb-24 md:pt-32 md:pb-36 overflow-hidden">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <motion.div
                            className="text-3xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight tracking-wide"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            style={{ minHeight: '120px', md: { minHeight: '150px' } }}
                        >
                            <span>Nền tảng trò chuyện</span>
                            <span className="block md:inline-block mx-1" />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
                                thông minh
                            </span>
                            <span className="block md:inline-block mx-1" />
                            <TypeWriter
                                texts={heroTexts}
                                className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-emerald-500 to-blue-500 animate-gradient-text inline-block font-bold"
                            />
                        </motion.div>

                        <motion.p
                            className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                        >
                            MFC kết hợp công nghệ AI tiên tiến, khả năng xử lý file và chuyển đổi giọng nói để mang đến trải nghiệm
                            trò chuyện đa chức năng vượt trội.
                        </motion.p>

                        <motion.div
                            className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                        >
                            <button
                                onClick={() => navigate("/sign-up")}
                                className="px-8 py-3 bg-black text-white rounded-md flex items-center justify-center font-medium transition-all duration-200 hover:scale-105"
                            >
                                Bắt đầu miễn phí
                                <span className="ml-2">
                                    <ArrowRight className="w-4 h-4" />
                                </span>
                            </button>
                            <button
                                onClick={() => {
                                    const featuresSection = document.getElementById("features")
                                    featuresSection.scrollIntoView({ behavior: "smooth" })
                                }}
                                className="px-8 py-3 bg-white border border-gray-300 text-gray-700 rounded-md flex items-center justify-center font-medium hover:border-gray-500 transition-all duration-200 hover:scale-105"
                            >
                                Tìm hiểu thêm
                            </button>
                        </motion.div>
                    </div>

                    {/* Preview Image with enhanced effects */}
                    <div className="mt-16 max-w-5xl mx-auto relative" style={{ opacity, scale }}>
                        <div className="relative rounded-xl overflow-hidden shadow-2xl border border-gray-200 transform perspective-1000">
                            <div className="absolute top-0 left-0 right-0 h-6 bg-gray-100 flex items-center px-3 space-x-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                            </div>
                            <img src={AppImage || "/placeholder.svg"} alt="MFC Preview" className="w-full" />
                        </div>

                        {/* Feature highlights around the image */}
                        <motion.div
                            className="absolute -top-4 -right-4 md:top-20 md:right-[-120px]"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
                        >
                            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-3 md:p-4 rounded-lg shadow-lg w-32 md:w-40 text-center border border-white/20">
                                <Headphones className="w-5 h-5 md:w-6 md:h-6 mx-auto mb-1 md:mb-2 text-blue-100" />
                                <h4 className="text-xs md:text-sm font-semibold">Text to Speech</h4>
                                <p className="text-[10px] md:text-xs mt-1 opacity-90">Chuyển đổi văn bản thành giọng nói tự nhiên</p>
                            </div>
                        </motion.div>

                        <motion.div
                            className="absolute -bottom-4 -left-4 md:bottom-20 md:left-[-100px]"
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.9, ease: "easeOut" }}
                        >
                            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-3 md:p-4 rounded-lg shadow-lg w-32 md:w-40 text-center border border-white/20">
                                <FileText className="w-5 h-5 md:w-6 md:h-6 mx-auto mb-1 md:mb-2 text-emerald-100" />
                                <h4 className="text-xs md:text-sm font-semibold">Tạo Văn Bản</h4>
                                <p className="text-[10px] md:text-xs mt-1 opacity-90">Tự động tạo nội dung chất lượng cao</p>
                            </div>
                        </motion.div>

                        <motion.div
                            className="absolute -bottom-13 md:bottom-[-60px] left-[800px] transform -translate-x-1/2"
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 1.1, ease: "easeOut" }}
                        >
                            <div className="bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white p-3 md:p-4 rounded-lg shadow-lg w-32 md:w-40 text-center border border-white/20">
                                <Users className="w-5 h-5 md:w-6 md:h-6 mx-auto mb-1 md:mb-2 text-purple-100" />
                                <h4 className="text-xs md:text-sm font-semibold">Giao Diện Thân Thiện</h4>
                                <p className="text-[10px] md:text-xs mt-1 opacity-90">Dễ sử dụng trên mọi thiết bị</p>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Thêm Marquee banner */}
                <div className="mt-16 pt-8 pb-4 bg-gray-50 border-y border-gray-100">
                    <Marquee items={logoItems} speed={30} className="py-2" />
                </div>
            </section>

            {/* Features Section with enhanced effects */}
            <section id="features" className="py-16 bg-gray-50 relative overflow-hidden">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.div
                        ref={featuresRef}
                        className="max-w-3xl mx-auto text-center mb-16"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Tính năng nổi bật</h2>
                        <p className="text-lg text-gray-600">
                            MFC được thiết kế với đầy đủ tính năng hiện đại nhằm mang lại trải nghiệm người dùng tốt nhất
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
                                viewport={{ once: true }}
                                className="h-full"
                            >
                                <TiltCard
                                    className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col"
                                >
                                    <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center mb-4">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                                    <p className="text-gray-600 flex-grow">{feature.description}</p>
                                </TiltCard>
                            </motion.div>
                        ))}
                    </div>

                    {/* Stats Counter section với ScrollReveal */}
                    <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div className="h-full">
                            <StatsCounter
                                from={0}
                                to={100}
                                duration={2}
                                suffix="+"
                                className="bg-white p-6 rounded-lg shadow-sm h-full"
                            >
                                <h4 className="text-lg font-semibold text-gray-900">Người dùng</h4>
                            </StatsCounter>
                        </div>

                        <div className="h-full">
                            <StatsCounter
                                from={0}
                                to={3}
                                duration={2}
                                suffix="+"
                                className="bg-white p-6 rounded-lg shadow-sm h-full"
                            >
                                <h4 className="text-lg font-semibold text-gray-900">Mô hình AI</h4>
                            </StatsCounter>
                        </div>

                        <div className="h-full">
                            <StatsCounter
                                from={0}
                                to={70}
                                duration={2}
                                suffix="%"
                                className="bg-white p-6 rounded-lg shadow-sm h-full"
                            >
                                <h4 className="text-lg font-semibold text-gray-900">Độ chính xác</h4>
                            </StatsCounter>
                        </div>

                        <div className="h-full">
                            <StatsCounter
                                from={0}
                                to={24}
                                duration={2}
                                suffix="/7"
                                className="bg-white p-6 rounded-lg shadow-sm h-full"
                            >
                                <h4 className="text-lg font-semibold text-gray-900">Hỗ trợ</h4>
                            </StatsCounter>
                        </div>
                    </div>
                </div>
            </section>
            <AIModelsSection />
            {/* CTA Section với hiệu ứng phức tạp */}
            <section className="py-16 relative overflow-hidden">
                {/* Gradient Background với animation */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 overflow-hidden">
                    {/* Hiệu ứng particle lấp lánh */}
                    <div className="absolute inset-0 opacity-20">
                        {Array.from({ length: 50 }).map((_, index) => (
                            <motion.div
                                key={index}
                                className="absolute rounded-full bg-white"
                                style={{
                                    width: Math.random() * 4 + 1 + "px",
                                    height: Math.random() * 4 + 1 + "px",
                                    top: Math.random() * 100 + "%",
                                    left: Math.random() * 100 + "%",
                                }}
                                animate={{
                                    opacity: [0.2, 1, 0.2],
                                    scale: [1, 1.5, 1],
                                }}
                                transition={{
                                    duration: Math.random() * 3 + 2,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: Math.random() * 2,
                                }}
                            />
                        ))}
                    </div>

                    {/* Hiệu ứng vòng sáng gradient di chuyển */}
                    <motion.div
                        className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-r from-purple-500/30 via-indigo-500/30 to-blue-500/30 blur-3xl"
                        animate={{
                            x: ['-25%', '25%', '-25%'],
                            y: ['-25%', '15%', '-25%'],
                        }}
                        transition={{
                            duration: 15,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        style={{ top: '30%', left: '20%' }}
                    />

                    <motion.div
                        className="absolute w-[400px] h-[400px] rounded-full bg-gradient-to-r from-pink-500/20 via-red-500/20 to-yellow-500/20 blur-3xl"
                        animate={{
                            x: ['25%', '-15%', '25%'],
                            y: ['15%', '-20%', '15%'],
                        }}
                        transition={{
                            duration: 18,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        style={{ top: '50%', right: '25%' }}
                    />
                </div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="max-w-3xl mx-auto text-center relative">
                        {/* Tiêu đề với hiệu ứng text */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 1 }}
                            viewport={{ once: true }}
                            className="mb-8"
                        >
                            <motion.h2
                                className="text-4xl font-bold text-white mb-2 inline-block relative"
                                initial={{ y: 50, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                viewport={{ once: true }}
                            >
                                Sẵn sàng trải nghiệm MFC?
                            </motion.h2>

                            <motion.p
                                className="text-xl text-white/80 mt-6"
                                initial={{ y: 50, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                                viewport={{ once: true }}
                            >
                                Đăng ký miễn phí ngay hôm nay và khám phá sức mạnh của trò chuyện AI thông minh
                            </motion.p>
                        </motion.div>

                        {/* Nút CTA với hiệu ứng đặc biệt */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.6 }}
                            viewport={{ once: true }}
                            className="relative inline-block"
                        >
                            <motion.div
                                className="absolute -inset-1 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 rounded-lg blur-lg opacity-70"
                                animate={{
                                    background: [
                                        "linear-gradient(90deg, #ec4899, #8b5cf6, #3b82f6)",
                                        "linear-gradient(90deg, #3b82f6, #ec4899, #8b5cf6)",
                                        "linear-gradient(90deg, #8b5cf6, #3b82f6, #ec4899)"
                                    ],
                                }}
                                transition={{ duration: 4, repeat: Infinity }}
                            />
                            <motion.button
                                onClick={() => navigate("/sign-up")}
                                className="relative px-8 py-4 bg-white text-gray-900 rounded-lg font-medium transition-all"
                                whileHover={{
                                    scale: 1.05,
                                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                                }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <span className="inline-flex items-center">
                                    <span className="mr-2 font-bold">Đăng ký ngay</span>
                                    <motion.span
                                        animate={{ x: [0, 5, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    >
                                        <ArrowRight className="w-4 h-4" />
                                    </motion.span>
                                </span>
                            </motion.button>
                        </motion.div>

                        {/* Trust indicators với hiệu ứng */}
                        <div className="mt-12 flex flex-wrap justify-center items-center gap-6">
                            {[
                                { icon: "M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12zm2.293-6.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", text: "Bảo mật" },
                                { icon: "M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z", text: "Tìm kiếm dễ dàng" },
                                { icon: "M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", text: "Đảm bảo chất lượng" },
                                { icon: "M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z", text: "Hỗ trợ 24/7" },
                            ].map((item, index) => (
                                <motion.div
                                    key={index}
                                    className="flex items-center text-white/80 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full hover:bg-white/20 transition-colors"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                                    viewport={{ once: true }}
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <motion.svg
                                        className="w-4 h-4 mr-2"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        initial={{ rotateY: 0 }}
                                        whileHover={{ rotateY: 360 }}
                                        transition={{ duration: 0.6 }}
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d={item.icon}
                                            clipRule="evenodd"
                                        />
                                    </motion.svg>
                                    <span className="text-sm font-medium">{item.text}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Hiệu ứng sóng ở dưới cùng */}
                <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden">
                    <svg
                        viewBox="0 0 1200 120"
                        preserveAspectRatio="none"
                        className="absolute bottom-0 w-full h-full"
                        style={{ transform: 'rotate(180deg)' }}
                    >
                        <path
                            fill="rgba(243, 244, 246, 1)"
                            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
                        />
                    </svg>
                </div>
            </section>

            {/* Footer with enhanced effects */}
            <footer className="py-8 bg-gray-100 relative overflow-hidden">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.div
                        className="flex flex-col md:flex-row justify-between items-center"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        viewport={{ once: true }}
                    >
                        <div className="flex items-center mb-4 md:mb-0">
                            <img src="https://openfxt.vercel.app/images/favicon.png" alt="Logo" className="h-8 w-8 mr-2" />
                            <h1 className="text-xl font-bold text-gray-900">{APP_NAME}</h1>
                            <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-md">v{APP_VERSION}</span>
                        </div>

                        <div className="text-sm text-gray-600">
                            © {new Date().getFullYear()} {APP_NAME}. Bản quyền thuộc về Reseter.
                            <div className="mt-1">
                                <a
                                    href="mailto:nguyenhuutai.reseter@gmail.com"
                                    className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
                                >
                                    nguyenhuutai.reseter@gmail.com
                                </a>
                            </div>
                        </div>
                    </motion.div>

                    <motion.button
                        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                        className="absolute right-8 bottom-8 bg-white p-2 rounded-full shadow-md hover:scale-110 transition-transform duration-200"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        viewport={{ once: true }}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 text-gray-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                    </motion.button>
                </div>
            </footer>
        </div>
    )
}

// Thêm keyframes cho animation Marquee vào file CSS
if (typeof document !== "undefined") {
    const style = document.createElement("style")
    style.textContent = `
        @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }
        .animate-marquee {
            animation: marquee linear infinite;
        }
        .text-shadow-sm {
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }
    `
    document.head.appendChild(style)
}
