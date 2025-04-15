import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { APP_NAME, PROVIDER_URL } from '../data/constant';

const NewChat = () => {
    const greetings = [
        "Tôi có thể giúp gì cho bạn?",
        "Ngày hôm nay của bạn thế nào?",
        "Chào bạn, chúc một ngày tốt lành!"
    ];

    const notes = [
        `<b>${APP_NAME}</b> có thể mắc lỗi!`,
        `<b>${APP_NAME}</b>, một sản phẩm của Reseter (<b>${PROVIDER_URL}</b>)`,
        `Hãy nhớ rằng <b>${APP_NAME}</b> đang trong giai đoạn thử nghiệm!`
    ];

    const [currentGreetingIndex, setCurrentGreetingIndex] = useState(0);
    const [currentNoteIndex, setCurrentNoteIndex] = useState(0);

    useEffect(() => {
        const greetingInterval = setInterval(() => {
            setCurrentGreetingIndex((prevIndex) => (prevIndex + 1) % greetings.length);
        }, 10000); 
        const noteInterval = setInterval(() => {
            setCurrentNoteIndex((prevIndex) => (prevIndex + 1) % notes.length);
        }, 5000); 

        return () => {
            clearInterval(greetingInterval);
            clearInterval(noteInterval);
        };
    }, [greetings.length, notes.length]);

    return (
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center"
            >
                <motion.img
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    src="https://openfxt.vercel.app/images/favicon.png"
                    alt="Logo"
                    className="mx-auto h-16 w-16 mb-4"
                />
                <AnimatePresence mode="wait">
                    <motion.h2
                        key={currentGreetingIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.5 }}
                        className="text-2xl font-bold mb-3 text-gray-900"
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
                        className="text-sm text-gray-500 mt-2"
                        dangerouslySetInnerHTML={{ __html: notes[currentNoteIndex] }}
                    />
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default NewChat; 