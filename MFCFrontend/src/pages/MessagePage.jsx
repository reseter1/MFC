import { useNavigate } from "react-router-dom"
import { APP_NAME, APP_VERSION } from "../data/constant"

export default function MessagePage({ message = "Thông báo mặc định" }) {
    const navigate = useNavigate()

    return (
        <main className="flex min-h-screen items-center justify-center bg-white p-4">
            <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-sm animate-fade-in-up">
                <div className="mb-6 flex flex-col items-center">
                    <div className="relative h-16 w-16 mb-4 animate-bounce">
                        <img
                            src="https://openfxt.vercel.app/images/favicon.png"
                            alt="Logo"
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 animate-fade-in">{APP_NAME} v{APP_VERSION}</h1>
                </div>

                <div className="space-y-4">
                    <p className="text-center text-gray-700 animate-fade-in-up">
                        {message}
                    </p>

                    <button
                        onClick={() => navigate("/")}
                        className="flex w-full items-center justify-center rounded-md bg-black py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-all duration-200 hover:scale-[1.02] animate-fade-in-up"
                    >
                        Quay lại trang chủ
                    </button>
                </div>
            </div>
        </main>
    )
} 