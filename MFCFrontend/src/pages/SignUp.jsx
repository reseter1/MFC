import { useState } from "react"
import { UserPlus, Loader2 } from "lucide-react"
import { APP_NAME, APP_VERSION } from "../data/constant"
import { useNavigate } from "react-router-dom"
import { useToast } from "../components/ToastProvider"
import { API_URL } from "../data/constant"
import MessagePage from "./MessagePage"
import { motion } from "framer-motion"

export default function SignUp() {
    const { addToast } = useToast()
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [message, setMessage] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            addToast("Mật khẩu không khớp", "error")
            return
        }

        if (username.length < 5) {
            addToast("Username phải có ít nhất 5 ký tự", "error")
            return
        }

        if (!/^[a-zA-Z]+$/.test(username)) {
            addToast("Username chỉ được chứa các chữ cái từ a-z", "error")
            return
        }

        if (!email.includes("@")) {
            addToast("Email không hợp lệ", "error")
            return
        }

        if (!password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)) {
            addToast("Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt", "error")
            return
        }

        try {
            setIsLoading(true)
            const response = await fetch(`${API_URL}/sign-up`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, email, password })
            })

            if (!response.ok) {
                const errorData = await response.json()
                if (!errorData.success && errorData.message) {
                    addToast(errorData.message, "error")
                } else {
                    addToast("Đã xảy ra lỗi không xác định", "error")
                }
                return
            }

            const data = await response.json()
            setMessage(data.message)
        } catch (error) {
            addToast("Lỗi kết nối đến máy chủ " + error, "error")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            {message ? <MessagePage message={message} /> : <>
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
                                Tạo tài khoản mới
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
                                <label htmlFor="username" className="block text-sm font-medium text-gray-900">
                                    Tên đăng nhập
                                </label>
                                <input
                                    id="username"
                                    type="text"
                                    placeholder="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-black transition-all duration-200 hover:shadow-sm"
                                    disabled={isLoading}
                                />
                                <p className="text-xs text-gray-500">Tên đăng nhập phải có ít nhất 5 ký tự và chỉ chứa chữ cái a-z</p>
                            </div>

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
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-black transition-all duration-200 hover:shadow-sm"
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="space-y-2 animate-fade-in-up">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                                    Mật khẩu
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-black transition-all duration-200 hover:shadow-sm"
                                    disabled={isLoading}
                                />
                                <p className="text-xs text-gray-500">Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt</p>
                            </div>

                            <div className="space-y-2 animate-fade-in-up">
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900">
                                    Xác nhận mật khẩu
                                </label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-black transition-all duration-200 hover:shadow-sm"
                                    disabled={isLoading}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`flex w-full items-center justify-center rounded-md py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-all duration-200 hover:scale-[1.02] animate-fade-in-up ${isLoading ? 'bg-gray-600 opacity-75 cursor-not-allowed' : 'bg-black'}`}
                            >
                                {isLoading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <UserPlus className="mr-2 h-4 w-4" />
                                )}
                                {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
                            </button>
                        </motion.form>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.7 }}
                            className="mt-6 text-center text-sm"
                        >
                            <span className="text-gray-500">Bạn đã có tài khoản?</span>{" "}
                            <a className={`font-medium ${isLoading ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:text-black cursor-pointer'} transition-all duration-500`} onClick={() => !isLoading && navigate("/sign-in")}>
                                Đăng nhập
                            </a>
                        </motion.div>
                    </motion.div>
                </motion.main>
            </>}
        </>
    )
}
