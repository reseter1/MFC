import { useState } from "react"
import { Key, Loader2 } from "lucide-react"
import { APP_NAME, APP_VERSION } from "../data/constant"
import { useToast } from "../components/ToastProvider"
import { useSearchParams } from "react-router-dom"
import { API_URL } from "../data/constant"
import MessagePage from "./MessagePage"
import { motion } from "framer-motion"

export default function ChangePassword() {
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [searchParams] = useSearchParams()
    const userId = searchParams.get('userId')
    const token = searchParams.get('token')
    const email = searchParams.get('email') || "example@domain.com"
    const { addToast } = useToast()
    const [message, setMessage] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (newPassword !== confirmPassword) {
            addToast("Mật khẩu không khớp", "error")
            return
        }

        if (!newPassword.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)) {
            addToast("Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt", "error")
            return
        }

        try {
            setIsLoading(true)
            const response = await fetch(`${API_URL}/change-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    UserId: userId,
                    Token: token,
                    Password: newPassword
                })
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
                            Đổi mật khẩu mới
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
                                value={email}
                                disabled
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-gray-100 cursor-not-allowed"
                            />
                        </div>

                        <div className="space-y-2 animate-fade-in-up">
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-900">
                                Mật khẩu mới
                            </label>
                            <input
                                id="newPassword"
                                type="password"
                                placeholder="••••••••"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
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
                                required
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
                                <Key className="mr-2 h-4 w-4" />
                            )}
                            {isLoading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                        </button>
                    </motion.form>
                </motion.div>
            </motion.main>
        )
    )
}