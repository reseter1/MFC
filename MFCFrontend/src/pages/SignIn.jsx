import { useState, useEffect, useRef } from "react"
import { LogIn, Loader2 } from "lucide-react"
import { APP_NAME, APP_VERSION } from "../data/constant"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useToast } from "../components/ToastProvider"
import { API_URL } from "../data/constant"
import { useAuth } from "../hooks/useAuth"
import { motion } from "framer-motion"

export default function SignIn() {
    const { addToast } = useToast()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()
    const { loginUser } = useAuth()
    const [searchParams] = useSearchParams()
    const code = searchParams.get('code')
    const authCallbackRef = useRef(false)

    useEffect(() => {
        if (code && !authCallbackRef.current) {
            authCallbackRef.current = true;
            handleGoogleCallback(code);
        }
    }, [code]);

    const handleGoogleCallback = async (code) => {
        try {
            setIsLoading(true);
            const response = await fetch(`${API_URL}/google-auth`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    Code: code
                })
            });

            const data = await response.json();
            if (data.success) {
                loginUser(data.token)
                addToast("Đăng nhập thành công", "success")
                navigate("/")
            } else {
                addToast(data.message, "error");
            }
        } catch (error) {
            addToast("Lỗi kết nối đến máy chủ " + error, "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (email === "" || password === "") {
            addToast("Vui lòng nhập email và mật khẩu", "error")
            return
        }

        try {
            setIsLoading(true)
            const response = await fetch(`${API_URL}/sign-in`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            })

            const data = await response.json()
            if (data.success) {
                loginUser(data.token)
                addToast("Đăng nhập thành công", "success")
                navigate("/")
            } else {
                addToast(data.message, "error")
            }
        } catch (error) {
            addToast("Lỗi kết nối đến máy chủ " + error, "error")
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogleLogin = () => {
        if (isLoading) return

        const clientId = "307540486543-9ph8q9goevqjb9lc97ivkjqdbhkejt46.apps.googleusercontent.com"
        const redirectUri = encodeURIComponent(window.location.origin + window.location.pathname)
        const scope = encodeURIComponent("email profile openid")
        const responseType = "code"
        const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}&access_type=offline&prompt=consent`
        window.location.href = googleAuthUrl
    }

    return (
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
                        Đăng nhập vào tài khoản của bạn
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
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-black transition-all duration-200 hover:shadow-sm"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="space-y-2 animate-fade-in-up">
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                                Mật khẩu
                            </label>
                            <a className={`text-xs font-medium ${isLoading ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:text-black cursor-pointer'} transition-colors duration-200`} onClick={() => !isLoading && navigate("/forgot-password")}>
                                Quên mật khẩu?
                            </a>
                        </div>
                        <input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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
                            <LogIn className="mr-2 h-4 w-4" />
                        )}
                        {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
                    </button>

                    <div className="relative my-4 animate-fade-in-up">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-gray-500">Hoặc tiếp tục với</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className={`flex w-full items-center justify-center rounded-md border border-gray-300 bg-white py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 hover:scale-[1.02] animate-fade-in-up ${isLoading ? 'text-gray-400 cursor-not-allowed opacity-75' : 'text-gray-900 focus:ring-gray-500'}`}
                    >
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                            <path d="M1 1h22v22H1z" fill="none" />
                        </svg>
                        Đăng nhập với Google
                    </button>
                </motion.form>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                    className="mt-6 text-center text-sm"
                >
                    <span className="text-gray-500">Bạn chưa có tài khoản?</span>{" "}
                    <a className={`${isLoading ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 cursor-pointer hover:text-black'} font-medium transition-colors duration-200`} onClick={() => !isLoading && navigate("/sign-up")}>
                        Đăng ký
                    </a>
                </motion.div>
            </motion.div>
        </motion.main>
    )
}