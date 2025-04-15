import React, { useState, useRef, useEffect } from "react";
import { Plus, Settings, LogOut, UserPlus, Menu, X, Send, Paperclip } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FileListItem from "../components/FileListItem";
import { APP_NAME, APP_VERSION, PROVIDER_URL } from "../data/constant";

const Home = () => {
    const [message, setMessage] = useState("");
    const [tempChatEnabled, setTempChatEnabled] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
    const [selectedModel, setSelectedModel] = useState("NULL Flash");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [selectedChat, setSelectedChat] = useState(null);

    const userMenuRef = useRef(null);
    const modelSelectorRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setUserMenuOpen(false);
            }
            if (modelSelectorRef.current && !modelSelectorRef.current.contains(event.target)) {
                setModelSelectorOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile) {
                setSidebarOpen(false);
            } else {
                setSidebarOpen(true);
            }
        };

        handleResize();

        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <div className="flex flex-col h-screen bg-white text-gray-900 text-base">
            <header className="flex items-center justify-between p-3 bg-white z-20 relative shadow-sm">
                <div className="flex items-center">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="mr-3 text-gray-600 hover:text-black focus:outline-none"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </motion.button>

                    <div className="flex items-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="relative h-6 w-6 mr-2"
                        >
                            <img
                                src="https://openfxt.vercel.app/images/favicon.png"
                                alt="MFC Logo"
                                className="object-contain w-full h-full"
                            />
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-lg font-semibold"
                        >
                            MFC
                        </motion.h1>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <motion.div
                        className="flex items-center"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <div
                            className={`relative inline-block w-10 h-5 rounded-full cursor-pointer mr-2 transition-colors duration-200 ${tempChatEnabled ? "bg-gray-800" : "bg-gray-300"}`}
                            onClick={() => setTempChatEnabled(!tempChatEnabled)}
                        >
                            <span
                                className={`absolute top-0.5 left-0.5 ${tempChatEnabled ? "bg-white" : "bg-white"} w-4 h-4 rounded-full shadow-sm transition-transform duration-200 ${tempChatEnabled ? "transform translate-x-5" : ""}`}
                            />
                        </div>
                        <label className="cursor-pointer" onClick={() => setTempChatEnabled(!tempChatEnabled)}>
                            Tạm thời
                        </label>
                    </motion.div>

                    <div className="relative" ref={userMenuRef}>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="rounded-full h-8 w-8 bg-gray-200 text-black flex items-center justify-center hover:bg-gray-300 transition-colors duration-200"
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                        >
                            <span>NH</span>
                        </motion.button>

                        <AnimatePresence>
                            {userMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute right-0 mt-2 w-48 bg-white text-black rounded-lg shadow-lg z-30 overflow-hidden border border-gray-200"
                                >
                                    <div className="py-1">
                                        <motion.button
                                            whileHover={{ backgroundColor: 'rgba(0,0,0,0.1)' }}
                                            className="flex items-center w-full px-3 py-2 text-left hover:bg-gray-100 transition-colors duration-150"
                                        >
                                            <Settings className="mr-2 h-4 w-4" />
                                            <span>Cài đặt</span>
                                        </motion.button>
                                        <div className="my-1 border-t border-gray-200"></div>
                                        <motion.button
                                            whileHover={{ backgroundColor: 'rgba(0,0,0,0.1)' }}
                                            onClick={() => {
                                                window.location.href = "/logout";
                                            }}
                                            className="flex items-center w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                                        >
                                            <LogOut className="mr-2 h-4 w-4" />
                                            <span>Đăng xuất</span>
                                        </motion.button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </header>

            {/* Main content area with sidebar and chat */}
            <div className="flex flex-1 overflow-hidden relative">
                {/* Sidebar - Light gray theme with smaller font */}
                <aside
                    className={`
                        absolute top-0 bottom-0 left-0 w-64 bg-gray-100 p-3 z-10
                        transform transition-transform duration-300 ease-in-out
                        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
                        md:${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
                        shadow-md flex flex-col
                    `}
                >
                    <div className="flex-1 overflow-y-auto">
                        <div className="relative" ref={modelSelectorRef}>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full bg-white rounded-md px-3 py-1.5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200 border border-gray-200 text-sm"
                                onClick={() => setModelSelectorOpen(!modelSelectorOpen)}
                            >
                                <span>{selectedModel}</span>
                                <svg
                                    className="h-3.5 w-3.5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </motion.button>

                            <AnimatePresence>
                                {modelSelectorOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute left-0 right-0 mt-1 bg-white text-gray-900 rounded-md shadow-lg z-20 overflow-hidden border border-gray-200 text-sm"
                                    >
                                        <div className="py-1">
                                            <div className="px-3 py-0.5 text-xs text-gray-500">Mô hình AI</div>
                                            <motion.button
                                                whileHover={{ backgroundColor: 'rgba(0,0,0,0.1)' }}
                                                className="flex items-center w-full px-3 py-1.5 text-left hover:bg-gray-100 transition-colors duration-150"
                                                onClick={() => {
                                                    setSelectedModel("NULL Flash");
                                                    setModelSelectorOpen(false);
                                                }}
                                            >
                                                NULL Flash
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ backgroundColor: 'rgba(0,0,0,0.1)' }}
                                                className="flex items-center w-full px-3 py-1.5 text-left hover:bg-gray-100 transition-colors duration-150"
                                                onClick={() => {
                                                    setSelectedModel("NULL Pro");
                                                    setModelSelectorOpen(false);
                                                }}
                                            >
                                                NULL Pro
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="mt-2 w-full flex items-center justify-start px-3 py-1.5 bg-white rounded-md hover:bg-gray-50 transition-colors duration-200 border border-gray-200 text-sm"
                        >
                            <Plus className="mr-1.5 h-3.5 w-3.5" />
                            <span>Cuộc trò chuyện mới</span>
                        </motion.button>

                        <div className="mt-3 mx-1 border-t border-gray-200"></div>

                        <div className="mt-3">
                            <h3 className="px-2 text-xs font-medium text-gray-500 mb-1.5">Cuộc trò chuyện gần đây</h3>
                            <div className="space-y-1">
                                <motion.button
                                    whileHover={{ backgroundColor: 'rgba(0,0,0,0.1)' }}
                                    className={`w-full text-left px-3 py-1.5 rounded-md transition-colors duration-150 text-sm ${selectedChat === 1 ? "bg-gray-200 font-medium" : "hover:bg-gray-200"}`}
                                    onClick={() => setSelectedChat(1)}
                                >
                                    Cuộc trò chuyện 1
                                </motion.button>
                                <motion.button
                                    whileHover={{ backgroundColor: 'rgba(0,0,0,0.1)' }}
                                    className={`w-full text-left px-3 py-1.5 rounded-md transition-colors duration-150 text-sm ${selectedChat === 2 ? "bg-gray-200 font-medium" : "hover:bg-gray-200"}`}
                                    onClick={() => setSelectedChat(2)}
                                >
                                    Cuộc trò chuyện 2
                                </motion.button>
                                <motion.button
                                    whileHover={{ backgroundColor: 'rgba(0,0,0,0.1)' }}
                                    className={`w-full text-left px-3 py-1.5 rounded-md transition-colors duration-150 text-sm ${selectedChat === 3 ? "bg-gray-200 font-medium" : "hover:bg-gray-200"}`}
                                    onClick={() => setSelectedChat(3)}
                                >
                                    Cuộc trò chuyện 3
                                </motion.button>
                            </div>
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className="mt-auto pt-3 border-t border-gray-200 text-center"
                    >
                        <div className="flex items-center justify-center mb-1">
                            <div className="relative h-5 w-5 mr-1">
                                <img
                                    src="https://openfxt.vercel.app/images/favicon.png"
                                    alt="Logo"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <p className="text-sm font-semibold text-gray-800">{APP_NAME}</p>
                        </div>
                        <p className="text-xs text-gray-500">Phiên bản: v{APP_VERSION}</p>
                    </motion.div>
                </aside>

                <AnimatePresence>
                    {sidebarOpen && isMobile && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0 bg-black z-5"
                            onClick={() => setSidebarOpen(false)}
                        ></motion.div>
                    )}
                </AnimatePresence>

                <div
                    className={`
                        flex-1 flex flex-col w-full bg-white
                        transition-all duration-300 ease-in-out
                        ${sidebarOpen && !isMobile ? "md:ml-64" : "ml-0"}
                    `}
                >
                    <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="text-center"
                        >
                            <h2 className="text-2xl font-bold mb-3 text-gray-900">Tôi có thể giúp gì cho bạn?</h2>
                            <p className="text-sm text-gray-500 mt-2">
                                <b>{APP_NAME}</b> có thể mắc lỗi, <b>{APP_NAME}</b>, một sản phẩm của Reseter (<b>{PROVIDER_URL}</b>)
                            </p>
                        </motion.div>
                    </div>

                    <div className="p-4">
                        <div className="relative max-w-3xl mx-auto md:max-w-xl">
                            <div className="absolute -top-11 left-2 w-[130px]">
                                <FileListItem />
                            </div>
                            <motion.input
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Hỏi bất kỳ điều gì"
                                className="w-full px-4 py-3 pr-20 bg-white rounded-full text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-300 shadow-sm border border-gray-200"
                            />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="h-8 w-8 flex items-center justify-center text-gray-600 hover:text-black transition-colors duration-150"
                                >
                                    <Paperclip className="h-5 w-5" />
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="h-8 w-8 flex items-center justify-center text-gray-600 hover:text-black transition-colors duration-150"
                                >
                                    <Send className="h-5 w-5" />
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;