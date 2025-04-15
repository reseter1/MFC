import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Mail, Loader2 } from "lucide-react"
import { APP_NAME, APP_VERSION } from "../data/constant"
import { useToast } from "../components/ToastProvider"
import MessagePage from "./MessagePage"
import { API_URL } from "../data/constant"
import { motion } from "framer-motion"

export default function ForgotPassword() {
    const [email, setEmail] = useState("")
    const navigate = useNavigate()
    const { addToast } = useToast()
    const [message, setMessage] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!email) {
            addToast("Vui lòng nhập email", "error")
            return
        }

        try {
            setIsLoading(true)
            const response = await fetch(`${API_URL}/forgot-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email })
            })

            const data = await response.json()
            if (data.success) {
                setMessage(data.message)
            } else {
                addToast(data.message, "error")
            }
        } catch (error) {
            addToast("Lỗi kết nối đến máy chủ + " + error, "error")
        } finally {
            setIsLoading(false)
        }
    }
    return (
        message ? (
            <MessagePage message={message} />
        ) : (
            <motion.main
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="flex min-h-screen items-center justify-center bg-white p-4"
            >
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-sm"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="mb-6 flex flex-col items-center"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="relative h-16 w-16 mb-4"
                        >
                            <img
                                src="https://openfxt.vercel.app/images/favicon.png"
                                alt="Logo"
                                className="w-full h-full object-contain"
                            />
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="text-2xl font-bold text-gray-900"
                        >
                            {APP_NAME} v{APP_VERSION}
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                            className="text-sm text-gray-500"
                        >
                            Đặt lại mật khẩu của bạn
                        </motion.p>
                    </motion.div>

                    <motion.form
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        onSubmit={handleSubmit}
                        className="space-y-4"
                    >
                        <div className="space-y-2 animate-fade-in-up">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-900">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none  focus:ring-black transition-all duration-200 hover:shadow-sm"
                                disabled={isLoading}
                            />
                            <p className="text-xs text-gray-500">Nhập email bạn đã đăng ký để nhận liên kết đặt lại mật khẩu</p>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`flex w-full items-center justify-center rounded-md py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-all duration-200 hover:scale-[1.02] animate-fade-in-up ${isLoading ? 'bg-gray-600 opacity-75 cursor-not-allowed' : 'bg-black'}`}
                        >
                            {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Mail className="mr-2 h-4 w-4" />
                            )}
                            {isLoading ? 'Đang xử lý...' : 'Gửi yêu cầu'}
                        </button>
                    </motion.form>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.7 }}
                        className="mt-6 text-center text-sm"
                    >
                        <span className="text-gray-500">Nhớ mật khẩu của bạn?</span>{" "}
                        <a className={`font-medium ${isLoading ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:text-black cursor-pointer'} transition-all duration-500`} onClick={() => !isLoading && navigate("/sign-in")}>
                            Đăng nhập
                        </a>
                    </motion.div>
                </motion.div>
            </motion.main>
        )
    )
} 