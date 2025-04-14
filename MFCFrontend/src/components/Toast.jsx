import { useEffect, useState } from "react"
import { X } from "lucide-react"

export default function Toast({ message, type = "info", duration = 5000, onClose }) {
    const [visible, setVisible] = useState(true)
    const [isExiting, setIsExiting] = useState(false)

    const closeToast = () => {
        setIsExiting(true)
        setTimeout(() => {
            setVisible(false)
            onClose && onClose()
        }, 500)
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            closeToast()
        }, duration)

        return () => clearTimeout(timer)
    }, [duration, onClose])

    if (!visible) return null

    const bgColor = {
        info: "bg-blue-50",
        success: "bg-green-50",
        warning: "bg-yellow-50",
        error: "bg-red-50"
    }[type]

    const textColor = {
        info: "text-blue-800",
        success: "text-green-800",
        warning: "text-yellow-800",
        error: "text-red-800"
    }[type]

    const animationStyle = isExiting ? {
        animation: 'slideOutRight 0.5s ease-out forwards'
    } : {
        animation: 'slideInRight 0.3s ease-out forwards'
    }

    return (
        <div 
            style={animationStyle}
            className={`relative mb-2 p-3 rounded-lg border border-gray-200 shadow-sm ${bgColor} ${textColor} min-w-[250px] sm:min-w-[200px] md:min-w-[300px] md:p-4`}
        >
            <div className="flex items-start justify-between">
                <span className="text-xs md:text-sm font-medium pr-3">{message}</span>
                <button
                    onClick={closeToast}
                    className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                >
                    <X className="h-3 w-3 md:h-4 md:w-4" />
                </button>
            </div>
        </div>
    )
} 