import { API_URL } from "../data/constant"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import MessagePage from "./MessagePage"

export default function ActivationAccount() {
    const [message, setMessage] = useState("Đang xử lý kích hoạt tài khoản...")
    const navigate = useNavigate()

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search)
        const userId = queryParams.get('userId')
        const token = queryParams.get('token')

        const activateAccount = async () => {
            try {
                const response = await fetch(`${API_URL}/activate?userId=${userId}&token=${token}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })

                const data = await response.json()
                if (response.ok) {
                    setMessage(data.message)
                } else {
                    setMessage(data.message)
                }
            } catch (error) {
                setMessage("Có lỗi xảy ra khi kích hoạt tài khoản. Vui lòng thử lại sau. Lỗi: " + error.message)
            }
        }

        if (userId && token) {
            activateAccount()
        } else {
            setMessage("Thiếu thông tin kích hoạt. Vui lòng thử lại sau.")
        }
    }, [navigate])

    return (
        <MessagePage message={message} />
    )
}