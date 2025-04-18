import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { APP_NAME, PROVIDER_URL } from '../data/constant';

const NewChat = () => {
    const greetings = [
        `Xin chào, tôi là ${APP_NAME}, tôi có thể giúp gì cho bạn?`,
        "Ngày hôm nay thật đẹp phải không, bạn có thể nói gì về ngày hôm nay?",
        "Thật vui khi được gặp bạn ở đây, điều gì khiến bạn thắc mắc?",
        "Bạn thật chăm chỉ học tập, vấn đề hiện tại của bạn là gì?",
        "Hãy làm việc năng suất nhé, tôi sẽ luôn ở đây để hỗ trợ bạn!"
    ];

    const notes = [
        `Bật mí cho bạn, tôi ở đây vì người lập trình ra tôi đang thất nghiệp và anh ta quá rảnh rỗi nên đã tạo ra tôi!`,
        `<b>${APP_NAME}</b> có thể mắc lỗi!`,
        `<b>${APP_NAME}</b> đang trong giai đoạn thử nghiệm! Đừng khắc khe với tôi quá nhé!`,
        `Bạn hãy luôn cố gắng hết mình cho đến khi gặp một người khác, bạn không cần giới thiệu bản thân là ai cả!`,
        `${APP_NAME} được tạo ra bởi <b>Reseter - Nguyễn Hữu Tài</b>!`,
        `Hiện tại người tạo ra tôi vẫn đang thất nghiệp, nên nếu có job thì bạn có thể liên hệ anh ta qua địa chỉ email <b>nguyenhuutai@reseter.space</b> nhé! Hihi!`
    ];

    const [currentGreetingIndex, setCurrentGreetingIndex] = useState(0);
    const [currentNoteIndex, setCurrentNoteIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const controls = useAnimation();

    const getRandomIndex = (length) => Math.floor(Math.random() * length);

    useEffect(() => {
        const greetingInterval = setInterval(() => {
            setCurrentGreetingIndex(getRandomIndex(greetings.length));
        }, 7000);
        const noteInterval = setInterval(() => {
            setCurrentNoteIndex(getRandomIndex(notes.length));
        }, 5000);

        controls.start({
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: "easeOut" }
        });

        return () => {
            clearInterval(greetingInterval);
            clearInterval(noteInterval);
        };
    }, [greetings.length, notes.length]);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    const floatingAnimation = {
        y: [0, -10, 0],
        rotate: [0, 5, 0, -5, 0],
        transition: {
            duration: 5,
            repeat: Infinity,
            repeatType: "reverse"
        }
    };

    return (
        <div
            className="flex-1 overflow-auto p-4 flex items-center justify-center relative bg-white"
            style={{ zIndex: 1 }}
        >
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={controls}
                className="max-w-2xl w-full"
            >
                <motion.div
                    className="text-center relative"
                >
                    <motion.div
                        className="mb-4 md:mb-8"
                        whileHover={{ scale: 1.1 }}
                        animate={floatingAnimation}
                    >
                        <motion.img
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            src="https://openfxt.vercel.app/images/favicon.png"
                            alt="Logo"
                            className="mx-auto h-16 w-16 md:h-20 md:w-20 drop-shadow-lg"
                            style={{ filter: "drop-shadow(0px 5px 15px rgba(59, 130, 246, 0.5))" }}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                        />

                        {/* Glow effect */}
                        <motion.div
                            className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 md:w-24 md:h-24 rounded-full bg-blue-400 opacity-25 blur-xl -z-10"
                            animate={{
                                scale: isHovered ? 1.5 : 1,
                                opacity: isHovered ? 0.4 : 0.25
                            }}
                        />
                    </motion.div>

                    <AnimatePresence mode="wait">
                        <motion.h2
                            key={currentGreetingIndex}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{
                                opacity: 1,
                                y: 0,
                                scale: [1, 1.03, 1]
                            }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.5 }}
                            className="text-xl md:text-2xl font-bold mb-3 md:mb-6 text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600"
                        >
                            {greetings[currentGreetingIndex]}
                        </motion.h2>
                    </AnimatePresence>

                    <AnimatePresence mode="wait">
                        <motion.p
                            key={currentNoteIndex}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="text-sm md:text-md text-gray-600 mt-2 mb-4 md:mb-6 px-2 md:px-4"
                            dangerouslySetInnerHTML={{ __html: notes[currentNoteIndex] }}
                        />
                    </AnimatePresence>

                    {/* Feature cards */}
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 mt-6 md:mt-10 px-2 md:px-4"
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                    >
                        {[
                            { icon: "💬", title: "Chat thông minh", desc: "Trò chuyện với AI tiên tiến" },
                            { icon: "🔍", title: "Tìm kiếm", desc: "Tìm kiếm thông tin nhanh chóng" },
                            { icon: "📁", title: "Quản lý file", desc: "Truy cập dễ dàng vào file của bạn" },
                            { icon: "⚡", title: "Thông minh", desc: "Học hỏi và thích nghi theo thời gian" }
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                className="bg-white p-3 md:p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                                variants={cardVariants}
                                whileHover={{
                                    y: -5,
                                    boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.1), 0 8px 10px -6px rgba(59, 130, 246, 0.1)"
                                }}
                            >
                                <div className="text-xl md:text-2xl mb-1 md:mb-2">{feature.icon}</div>
                                <h3 className="font-semibold text-sm md:text-base text-gray-800">{feature.title}</h3>
                                <p className="text-xs md:text-sm text-gray-600">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default NewChat;