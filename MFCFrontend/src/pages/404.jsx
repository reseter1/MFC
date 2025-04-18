import { useNavigate } from "react-router-dom"
import { APP_NAME, APP_VERSION } from "../data/constant"
import { motion } from "framer-motion"

export default function NotFound() {
    const navigate = useNavigate()

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
                        404 - Trang không tồn tại
                    </motion.p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="space-y-4"
                >
                    <p className="text-center text-gray-700">
                        Trang bạn đang tìm kiếm có thể đã bị xóa hoặc không tồn tại.
                    </p>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate("/chat")}
                        className="flex w-full items-center justify-center rounded-md bg-black py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-all duration-200"
                    >
                        Quay lại trang chủ
                    </motion.button>
                </motion.div>
            </motion.div>
        </motion.main>
    )
}
