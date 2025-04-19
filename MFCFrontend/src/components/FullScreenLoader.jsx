import React from 'react';
import { motion } from 'framer-motion';
import { useLoading } from '../contexts/LoadingContext';

const FullScreenLoader = ({ isLoading = true }) => {
    const { message } = useLoading();

    if (!isLoading) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.85 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-white via-gray-50 to-gray-100 backdrop-blur-sm"
        >
            <div className="flex flex-col items-center">
                <div className="relative flex justify-center items-center">
                    {/* Hình tròn ngoài cùng */}
                    <motion.div
                        className="absolute w-24 h-24 rounded-full border-3 border-transparent border-t-blue-500 border-b-indigo-600"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />

                    {/* Hình tròn thứ hai */}
                    <motion.div
                        className="absolute w-16 h-16 rounded-full border-3 border-transparent border-l-purple-500 border-r-pink-500"
                        animate={{ rotate: -360 }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                    />

                    {/* Hình tròn thứ ba */}
                    <motion.div
                        className="absolute w-12 h-12 rounded-full border-3 border-transparent border-t-teal-500 border-b-cyan-500"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />

                    {/* Logo ở giữa */}
                    <motion.div
                        className="w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center z-10"
                        animate={{
                            scale: [1, 1.1, 1],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        <img
                            src="https://openfxt.vercel.app/images/favicon.png"
                            alt="Logo"
                            className="w-5 h-5 object-contain"
                        />
                    </motion.div>
                </div>

                {/* Text hiệu ứng */}
                <motion.div
                    className="mt-8 text-center animate-fade-in-up"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className="mt-6 text-gray-700 text-base font-medium mb-2">{message}</div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default FullScreenLoader; 