import React from 'react';
import { motion } from 'framer-motion';

const ChatContent = () => {
    const messages = [
        { id: 1, sender: 'user', content: 'Xin chào! Tôi có thể hỏi về cách sử dụng MFC không?' },
        { id: 2, sender: 'bot', content: 'Chào bạn! Tất nhiên rồi, tôi rất vui được giúp. Bạn muốn biết cụ thể về tính năng nào của MFC?' },
        { id: 3, sender: 'user', content: 'Tôi muốn biết cách tạo một cuộc trò chuyện mới.' },
        { id: 4, sender: 'bot', content: 'Để tạo một cuộc trò chuyện mới, bạn chỉ cần nhấp vào nút "Cuộc trò chuyện mới" ở sidebar bên trái. Sau đó, bạn có thể bắt đầu nhập câu hỏi hoặc yêu cầu của mình vào ô chat ở dưới cùng.' },
        { id: 5, sender: 'user', content: 'Cảm ơn! Vậy còn cách chọn model AI thì sao?' },
        { id: 6, sender: 'bot', content: 'Để chọn model AI, bạn nhấp vào nút chọn model ở đầu sidebar. Một danh sách các model sẽ hiện ra, và bạn có thể chọn model phù hợp với nhu cầu của mình.' },
        { id: 7, sender: 'user', content: 'Mỗi model AI có những đặc điểm riêng, bạn có thể xem mô tả chi tiết của từng model khi chọn để quyết định model nào phù hợp nhất với yêu cầu của bạn.' },
    ];

    return (
        <div className="flex-1 overflow-auto p-4">
            <div className="max-w-3xl mx-auto space-y-4 pb-16">
                {messages.map((message) => (
                    <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: message.id * 0.1 }}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-md p-3 rounded-lg ${message.sender === 'user' ? 'bg-gray-200 text-gray-900' : 'bg-gray-100 text-gray-900'}`}>
                            <p className="text-sm font-medium mb-1">{message.sender === 'user' ? 'Bạn' : 'MFC Bot'}</p>
                            <p className="text-base">{message.content}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default ChatContent; 