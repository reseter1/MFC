import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, Settings, LogOut, UserPlus, Menu, X, Send, Paperclip } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FileListItem from "../components/FileListItem";
import SettingPopup from "../components/SettingPopup";
import { APP_NAME, APP_VERSION, API_URL, API_URL_GENAI } from "../data/constant";
import ChatContent from "../components/ChatContent";
import { useToast } from "../components/ToastProvider";

const tempChatPulseKeyframes = `
@keyframes tempChatPulse {
    0% {
        box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.3);
    }
    70% {
        box-shadow: 0 0 0 6px rgba(251, 191, 36, 0);
    }
    100% {
        box-shadow: 0 0 0 0 rgba(251, 191, 36, 0);
    }
}
`;

const Home = () => {
    const [message, setMessage] = useState("");
    const [tempChatEnabled, setTempChatEnabled] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [selectedModel, setSelectedModel] = useState("NULL Flash");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const initialContextId = searchParams.get('contextId');
    const [selectedChat, setSelectedChat] = useState(initialContextId || null);
    const [models, setModels] = useState([]);
    const [chatContexts, setChatContexts] = useState([]);
    const [currentMessages, setCurrentMessages] = useState([]);
    const [isLoadingBotResponse, setIsLoadingBotResponse] = useState(false);
    const [files, setFiles] = useState([]);
    const { addToast } = useToast();
    const navigate = useNavigate();
    const userMenuRef = useRef(null);
    const modelSelectorRef = useRef(null);
    const hasFetchedRef = useRef(false);
    const hasCheckedContextIdRef = useRef(false);
    const [userData, setUserData] = useState({
        displayName: "Unauthorized",
        username: "Unauthorized",
        email: "Unauthorized",
    });
    const [chatOptionsOpen, setChatOptionsOpen] = useState(null);
    const [isRenamingChat, setIsRenamingChat] = useState(null);
    const [newChatTitle, setNewChatTitle] = useState("");
    const chatItemRefs = useRef({});
    const prevTempChatEnabledRef = useRef(false);
    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    const isValidContextId = (contextId) => {
        return contextId && contextId.length === 20 && /^[a-zA-Z0-9]+$/.test(contextId);
    };

    useEffect(() => {
        const fetchFiles = async () => {
            if (!selectedChat) return;

            try {
                const response = await fetch(`${API_URL_GENAI}/admin/get-files`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        contextId: selectedChat
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    setFiles(data.data);
                } else {
                    const errorData = await response.json();
                    addToast("Đã xảy ra lỗi khi lấy danh sách file: " + (errorData.message), 'error');
                }
            } catch (error) {
                addToast("Lỗi kết nối: " + error.message, 'error');
            }
        };

        fetchFiles();
    }, [selectedChat]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setUserMenuOpen(false);
            }
            if (modelSelectorRef.current && !modelSelectorRef.current.contains(event.target)) {
                setModelSelectorOpen(false);
            }
            if (chatOptionsOpen && !event.target.closest('.chat-options-menu')) {
                setChatOptionsOpen(null);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [chatOptionsOpen]);

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

    useEffect(() => {
        const fetchModels = async () => {
            try {
                const response = await fetch(`${API_URL_GENAI}/admin/get-models`);
                const data = await response.json();

                if (data.success) {
                    setModels(data.data);
                    if (data.data.length > 0) {
                        setSelectedModel(data.data[0].name);
                    }
                } else {
                    setModels([{ name: 'NaN', value: 'nan', description: data.message || 'Lỗi khi lấy danh sách model' }]);
                    setSelectedModel('NaN');
                }
            } catch (error) {
                const errorMessage = 'Không thể kết nối đến server để lấy danh sách model';
                setModels([{ name: 'NaN', value: 'nan', description: errorMessage }]);
                setSelectedModel('NaN');
            }
        };

        fetchModels();
    }, []);

    useEffect(() => {
        const fetchChatContexts = async () => {
            if (hasFetchedRef.current) return;
            hasFetchedRef.current = true;

            const token = localStorage.getItem('access_token');
            if (!token) {
                navigate('/logout');
                return;
            }

            try {
                const response = await fetch(`${API_URL}/api/user/get-chat-contexts`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();

                if (data.success) {
                    setChatContexts(data.data);
                } else {
                    if (data.message && !data.message.toLowerCase().includes('token') && !data.message.toLowerCase().includes('unauthorized')) {
                        addToast("Đã xảy ra lỗi khi lấy danh sách chat contexts: " + data.message, 'error');
                    }
                    navigate('/logout');
                }
            } catch (error) {
                navigate('/logout');
            }
        };

        fetchChatContexts();
    }, [navigate]);

    useEffect(() => {
        const fetchUserInfo = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) {
                navigate('/logout');
                return;
            }

            try {
                const response = await fetch(`${API_URL}/api/user/get-user-info`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();

                if (data.success) {
                    setUserData({
                        displayName: data.data.displayName,
                        username: data.data.username,
                        email: data.data.email,
                    });
                } else {
                    if (data.message && !data.message.toLowerCase().includes('token') &&
                        !data.message.toLowerCase().includes('unauthorized') &&
                        !data.message.toLowerCase().includes('object reference') &&
                        !data.message.toLowerCase().includes('not set to an instance')) {
                        addToast("Đã xảy ra lỗi khi lấy thông tin người dùng: " + data.message, 'error');
                    }
                    navigate('/logout');
                }
            } catch (error) {
                navigate('/logout');
            }
        };

        fetchUserInfo();
    }, [navigate]);

    useEffect(() => {
        const fetchNewContextId = async () => {
            try {
                const response = await fetch(`${API_URL_GENAI}/admin/get-new-context-id`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        setSelectedChat(data.data);
                        setCurrentMessages([]);
                    } else {
                        addToast("Đã xảy ra lỗi khi lấy context ID mới: " + data.message, 'error');
                    }
                } else {
                    const errorData = await response.json();
                    addToast("Đã xảy ra lỗi khi lấy context ID mới: " + errorData.message, 'error');
                }
            } catch (error) {
                addToast("Lỗi kết nối khi lấy context ID mới: " + error.message, 'error');
            }
        };

        const checkAndCreateContextId = () => {
            if (hasCheckedContextIdRef.current) return;
            hasCheckedContextIdRef.current = true;

            if (!selectedChat || (initialContextId && !isValidContextId(initialContextId))) {
                fetchNewContextId();
            }
        };

        checkAndCreateContextId();
    }, [initialContextId, selectedChat]);

    useEffect(() => {
        if (selectedChat) {
            setSearchParams({ contextId: selectedChat });
        }
    }, [selectedChat, setSearchParams]);

    useEffect(() => {
        const fetchNewContextId = async () => {
            try {
                const response = await fetch(`${API_URL_GENAI}/admin/get-new-context-id`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        setSelectedChat(data.data);
                        setCurrentMessages([]);
                    } else {
                        addToast("Đã xảy ra lỗi khi lấy context ID mới: " + data.message, 'error');
                    }
                } else {
                    const errorData = await response.json();
                    addToast("Đã xảy ra lỗi khi lấy context ID mới: " + errorData.message, 'error');
                }
            } catch (error) {
                addToast("Lỗi kết nối khi lấy context ID mới: " + error.message, 'error');
            }
        };

        if (prevTempChatEnabledRef.current !== tempChatEnabled) {
            fetchNewContextId();
        }

        prevTempChatEnabledRef.current = tempChatEnabled;
    }, [tempChatEnabled]);

    useEffect(() => {
        const styleElement = document.createElement('style');
        styleElement.innerHTML = tempChatPulseKeyframes;
        document.head.appendChild(styleElement);

        return () => {
            document.head.removeChild(styleElement);
        };
    }, []);

    const handleSendMessage = async () => {
        if (message.trim() === "") return;

        if (currentMessages.length === 0 && !tempChatEnabled) {
            try {
                const response = await fetch(`${API_URL}/api/user/add-new-chat-context`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        ContextId: selectedChat,
                        ChatTitle: "New Chat"
                    })
                });

                const data = await response.json();
                if (!data.success) {
                    addToast("Đã xảy ra lỗi khi thêm chat context mới: " + data.message, 'error');
                } else {
                    setChatContexts(prevChats => [{
                        contextId: selectedChat,
                        chatTitle: "New Chat"
                    }, ...prevChats]);

                    const currentModel = models.find(model => model.name === selectedModel);
                    const modelValue = currentModel ? currentModel.value : 'nan';

                    fetch(`${API_URL_GENAI}/v2/ai-gen`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            prompt: `Giúp tôi đặt tên cho đoạn chat với tin nhắn đầu tiên là câu hỏi này: ${message}. Hãy chỉ đưa ra string tên chat và đừng nói gì thêm!`,
                            model: modelValue
                        })
                    }).then(titleResponse => {
                        if (titleResponse.ok) {
                            return titleResponse.json();
                        }
                        throw new Error("Không thể lấy tên chat từ API");
                    }).then(titleData => {
                        if (titleData.success && titleData.text) {
                            const chatTitle = titleData.text.trim();

                            return fetch(`${API_URL}/api/user/change-title-chat`, {
                                method: 'POST',
                                headers: {
                                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    NewTitle: chatTitle,
                                    ContextId: selectedChat
                                })
                            }).then(response => response.json())
                                .then(data => {
                                    if (data.success) {
                                        setChatContexts(prevContexts => prevContexts.map(chat =>
                                            chat.contextId === selectedChat
                                                ? { ...chat, chatTitle: chatTitle }
                                                : chat
                                        ));
                                    }
                                });
                        }
                    }).catch(error => {
                        console.error("Lỗi khi cập nhật tên chat:", error);
                    });
                }
            } catch (error) {
                addToast("Lỗi kết nối khi thêm chat context mới: " + error.message, 'error');
            }
        }

        const newMessage = {
            id: currentMessages.length + 1,
            sender: 'user',
            content: message
        };

        setCurrentMessages(prevMessages => [...prevMessages, newMessage]);
        setMessage("");
        setIsLoadingBotResponse(true);

        setTimeout(() => {
            const textarea = document.querySelector('textarea[placeholder="Hỏi bất kỳ điều gì"]');
            if (textarea) {
                textarea.style.height = 'auto';
            }
        }, 0);

        await new Promise(resolve => setTimeout(resolve, 500));

        try {
            const currentModel = models.find(model => model.name === selectedModel);
            const modelValue = currentModel ? currentModel.value : 'nan';

            const response = await fetch(`${API_URL_GENAI}/v2/ai-gen`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: message,
                    model: modelValue,
                    contextId: selectedChat
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setCurrentMessages(prevMessages => {
                        const botResponse = {
                            id: prevMessages.length + 1,
                            sender: 'bot',
                            content: data.text
                        };
                        return [...prevMessages, botResponse];
                    });
                } else {
                    addToast("Lỗi từ AI: " + data.message, 'error');
                }
            } else {
                const errorData = await response.json();
                addToast("Lỗi khi gọi API AI: " + errorData.message, 'error');
            }
        } catch (error) {
            addToast("Lỗi kết nối khi gọi API AI: " + error.message, 'error');
        } finally {
            setIsLoadingBotResponse(false);
        }
    };

    const handleChatOptionsClick = (contextId) => {
        if (tempChatEnabled) return;
        setChatOptionsOpen(chatOptionsOpen === contextId ? null : contextId);
    };

    const handleRenameChat = (contextId) => {
        if (tempChatEnabled) return;
        const chatToRename = chatContexts.find(chat => chat.contextId === contextId);
        if (chatToRename) {
            setIsRenamingChat(contextId);
            setNewChatTitle(chatToRename.chatTitle);
        }
        setChatOptionsOpen(null);
    };

    const handleRenameSubmit = async (contextId) => {
        if (!newChatTitle.trim()) {
            addToast("Tên chat không được để trống", "error");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/user/change-title-chat`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ NewTitle: newChatTitle, ContextId: contextId })
            });

            const data = await response.json();
            if (data.success) {
                setChatContexts(chatContexts.map(chat =>
                    chat.contextId === contextId
                        ? { ...chat, chatTitle: newChatTitle }
                        : chat
                ));
                addToast(data.message, "success");
            } else {
                addToast(data.message, "error");
            }
        } catch (error) {
            addToast("Có lỗi xảy ra khi đổi tên chat: " + error.message, "error");
        } finally {
            setIsRenamingChat(null);
            setNewChatTitle("");
        }
    };

    const handleRenameCancel = () => {
        setIsRenamingChat(null);
        setNewChatTitle("");
    };

    const handleDeleteChat = async (contextId) => {
        if (tempChatEnabled) return;
        try {
            const response = await fetch(`${API_URL}/api/user/delete-one-chat-context`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ContextId: contextId })
            });

            const data = await response.json();
            if (data.success) {
                setChatContexts(chatContexts.filter(chat => chat.contextId !== contextId));
                if (selectedChat === contextId) {
                    setSelectedChat(null);
                    try {
                        const response = await fetch(`${API_URL_GENAI}/admin/get-new-context-id`, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        });

                        if (response.ok) {
                            const newContextData = await response.json();
                            if (newContextData.success) {
                                setSelectedChat(newContextData.data);
                                setCurrentMessages([]);
                            } else {
                                addToast("Đã xảy ra lỗi khi lấy context ID mới: " + newContextData.message, 'error');
                            }
                        } else {
                            const errorData = await response.json();
                            addToast("Đã xảy ra lỗi khi lấy context ID mới: " + errorData.message, 'error');
                        }
                    } catch (error) {
                        addToast("Lỗi kết nối khi lấy context ID mới: " + error.message, 'error');
                    }
                }
                addToast("Đã xóa đoạn chat thành công", "success");
            } else {
                addToast("Đã xảy ra lỗi khi xóa đoạn chat: " + data.message, "error");
            }
        } catch (error) {
            addToast("Có lỗi xảy ra khi xóa đoạn chat: " + error.message, "error");
        } finally {
            setChatOptionsOpen(null);
        }
    };

    const calculateMenuPosition = (contextId) => {
        if (chatItemRefs.current[contextId]) {
            const rect = chatItemRefs.current[contextId].getBoundingClientRect();
            return {
                top: rect.top + window.scrollY + (rect.height / 2) - 35,
                right: 4
            };
        }
        return {
            top: 0,
            right: 4
        };
    };

    const handleFileUpload = async (e) => {
        setIsDragging(false);

        const selectedFiles = Array.from(e.target.files || e.dataTransfer?.files || []);
        if (!selectedFiles.length) return;

        if (!selectedChat) {
            addToast("Vui lòng bắt đầu cuộc trò chuyện trước khi tải lên tệp", "error");
            return;
        }

        let hasSuccessfulUpload = false;
        setIsLoadingBotResponse(true);

        for (const file of selectedFiles) {
            const formData = new FormData();
            formData.append('upload', file);
            formData.append('contextId', selectedChat);

            try {
                const response = await fetch(`${API_URL_GENAI}/v2/upload-file`, {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();

                if (data.success) {
                    hasSuccessfulUpload = true;
                } else {
                    addToast(`Lỗi khi tải lên tệp "${file.name}": ${data.message || data.error}`, "error");
                }
            } catch (error) {
                addToast(`Lỗi kết nối khi tải lên tệp "${file.name}": ${error.message}`, "error");
            }
        }

        if (hasSuccessfulUpload) {
            try {
                const fileResponse = await fetch(`${API_URL_GENAI}/admin/get-files`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        contextId: selectedChat
                    })
                });

                if (fileResponse.ok) {
                    const fileData = await fileResponse.json();
                    if (fileData.success) {
                        setFiles(fileData.data);
                    }
                }
            } catch (fileError) {
                console.error("Lỗi khi cập nhật danh sách file:", fileError);
                addToast("Không thể cập nhật danh sách file", "error");
            }
        }

        setIsLoadingBotResponse(false);
        if (e.target.value) e.target.value = '';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleFileUpload(e);
    };

    const handleChatSelection = (contextId) => {
        if (tempChatEnabled) {
            addToast("Không thể chuyển đổi cuộc trò chuyện khi đang ở chế độ tạm thời", "warning");
            return;
        }
        setSelectedChat(contextId);
    };

    const handleNewChat = async () => {
        if (tempChatEnabled) {
            addToast("Không thể tạo cuộc trò chuyện mới khi đang ở chế độ tạm thời", "warning");
            return;
        }

        try {
            const response = await fetch(`${API_URL_GENAI}/admin/get-new-context-id`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setSelectedChat(data.data);
                    setCurrentMessages([]);
                } else {
                    addToast("Đã xảy ra lỗi khi lấy context ID mới: " + data.message, 'error');
                }
            } else {
                const errorData = await response.json();
                addToast("Đã xảy ra lỗi khi lấy context ID mới: " + errorData.message, 'error');
            }
        } catch (error) {
            addToast("Lỗi kết nối khi lấy context ID mới: " + error.message, 'error');
        }
    };

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
                            className={`relative inline-block w-10 h-5 rounded-full cursor-pointer mr-2 transition-colors duration-200 ${tempChatEnabled ? "bg-amber-500" : "bg-gray-300"}`}
                            onClick={() => setTempChatEnabled(!tempChatEnabled)}
                        >
                            <span
                                className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full shadow-sm transition-transform duration-200 ${tempChatEnabled ? "transform translate-x-5" : ""}`}
                            />
                        </div>
                        <label className={`cursor-pointer ${tempChatEnabled ? "text-amber-600 font-medium" : ""}`} onClick={() => setTempChatEnabled(!tempChatEnabled)}>
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
                                            onClick={() => {
                                                setSettingsOpen(true);
                                                setUserMenuOpen(false);
                                            }}
                                            className="flex items-center w-full px-3 py-2 text-left hover:bg-gray-100 transition-colors duration-150"
                                        >
                                            <Settings className="mr-2 h-4 w-4" />
                                            <span>Cài đặt</span>
                                        </motion.button>
                                        <div className="my-1 border-t border-gray-200"></div>
                                        <motion.button
                                            whileHover={{ backgroundColor: 'rgba(0,0,0,0.1)' }}
                                            onClick={() => {
                                                navigate('/logout');
                                                setUserMenuOpen(false);
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
                    <div className="flex flex-col h-full">
                        <div className="flex-1">
                            <div className="relative" ref={modelSelectorRef}>
                                <motion.button
                                    whileHover={{ filter: "brightness(0.98)" }}
                                    whileTap={{ filter: "brightness(0.95)" }}
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
                                                {models.map((model, index) => (
                                                    <motion.div
                                                        key={model.value}
                                                        className="relative"
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.05 }}
                                                    >
                                                        <motion.button
                                                            whileHover={{ backgroundColor: 'rgba(0,0,0,0.1)' }}
                                                            className="flex items-center w-full px-3 py-1.5 text-left hover:bg-gray-100 transition-colors duration-150 model-item"
                                                            onClick={() => {
                                                                setSelectedModel(model.name);
                                                                setModelSelectorOpen(false);
                                                            }}
                                                            title={model.description}
                                                        >
                                                            {model.name}
                                                        </motion.button>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <motion.button
                                whileHover={{ filter: "brightness(0.98)" }}
                                whileTap={{ filter: "brightness(0.95)" }}
                                className={`mt-2 w-full flex items-center justify-start px-3 py-1.5 bg-white rounded-md hover:bg-gray-50 transition-colors duration-200 border border-gray-200 text-sm ${tempChatEnabled || isLoadingBotResponse ? "opacity-60 cursor-not-allowed" : ""}`}
                                onClick={handleNewChat}
                                disabled={tempChatEnabled || isLoadingBotResponse}
                            >
                                <Plus className="mr-1.5 h-3.5 w-3.5" />
                                <span>Cuộc trò chuyện mới</span>
                            </motion.button>

                            <div className="mt-3 mx-1 border-t border-gray-200"></div>

                            <div className="mt-3">
                                <h3 className="px-2 text-xs font-medium text-gray-500 mb-1.5">Cuộc trò chuyện gần đây</h3>
                                <div className="space-y-1 max-h-[calc(100vh-250px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent scrollbar-thumb-rounded-full scrollbar-track-rounded-full">
                                    {chatContexts.map((chat, index) => (
                                        <div key={chat.contextId} className="relative group" ref={el => chatItemRefs.current[chat.contextId] = el}>
                                            {isRenamingChat === chat.contextId ? (
                                                <div className="w-full transition-colors duration-150 text-sm bg-gray-200 rounded-md">
                                                    <input
                                                        type="text"
                                                        value={newChatTitle}
                                                        onChange={(e) => setNewChatTitle(e.target.value)}
                                                        className="w-full px-3 py-1.5 bg-transparent focus:outline-none text-gray-900 rounded-md"
                                                        autoFocus
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                handleRenameSubmit(chat.contextId);
                                                            } else if (e.key === 'Escape') {
                                                                handleRenameCancel();
                                                            }
                                                        }}
                                                    />
                                                    <div className="flex justify-end space-x-1 pb-1 px-2">
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={handleRenameCancel}
                                                            className="text-gray-500 hover:text-gray-700 text-xs p-0.5 rounded-full hover:bg-gray-100"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </motion.button>
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => handleRenameSubmit(chat.contextId)}
                                                            className="text-green-500 hover:text-green-700 text-xs p-0.5 rounded-full hover:bg-gray-100"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <polyline points="20 6 9 17 4 12"></polyline>
                                                            </svg>
                                                        </motion.button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <motion.button
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                                    className={`w-full text-left px-3 py-1.5 rounded-md transition-colors duration-150 text-sm ${selectedChat === chat.contextId ? "bg-gray-300" : "bg-transparent hover:bg-gray-200"} ${tempChatEnabled || isLoadingBotResponse ? "opacity-60 cursor-not-allowed" : ""}`}
                                                    onClick={() => handleChatSelection(chat.contextId)}
                                                    disabled={tempChatEnabled || isLoadingBotResponse}
                                                >
                                                    <span className="truncate block pr-6" style={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chat.chatTitle}</span>
                                                </motion.button>
                                            )}
                                            <motion.div
                                                className="absolute right-2 top-1/2 -translate-y-1/2 z-40"
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{
                                                    opacity: isRenamingChat === chat.contextId ? 0 : (selectedChat === chat.contextId ? 1 : chatOptionsOpen === chat.contextId ? 1 : 0),
                                                    scale: isRenamingChat === chat.contextId ? 0.8 : (selectedChat === chat.contextId ? 1 : chatOptionsOpen === chat.contextId ? 1 : 0.8)
                                                }}
                                                whileHover={{
                                                    opacity: isRenamingChat === chat.contextId ? 0 : (selectedChat === chat.contextId ? 1 : 0),
                                                    scale: isRenamingChat === chat.contextId ? 0.8 : (selectedChat === chat.contextId ? 1 : 0.8)
                                                }}
                                                transition={{ duration: 0.2, ease: "easeOut" }}
                                            >
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleChatOptionsClick(chat.contextId);
                                                    }}
                                                    disabled={tempChatEnabled || isLoadingBotResponse}
                                                    style={{ opacity: tempChatEnabled || isLoadingBotResponse ? 0.4 : 1, cursor: tempChatEnabled || isLoadingBotResponse ? 'not-allowed' : 'pointer' }}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <circle cx="12" cy="12" r="1"></circle>
                                                        <circle cx="12" cy="5" r="1"></circle>
                                                        <circle cx="12" cy="19" r="1"></circle>
                                                    </svg>
                                                </motion.button>
                                            </motion.div>
                                            <AnimatePresence>
                                                {chatOptionsOpen === chat.contextId && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: 10 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="fixed w-32 bg-white rounded-lg shadow-lg z-40 overflow-hidden border border-gray-200"
                                                        style={{
                                                            top: `${calculateMenuPosition(chat.contextId).top}px`,
                                                            right: `${calculateMenuPosition(chat.contextId).right}px`,
                                                        }}
                                                    >
                                                        <motion.button
                                                            whileHover={{ backgroundColor: 'rgba(0,0,0,0.1)' }}
                                                            onClick={() => handleRenameChat(chat.contextId)}
                                                            className="w-full text-left px-3 py-2 hover:bg-gray-100 transition-colors duration-150 text-sm"
                                                            disabled={tempChatEnabled || isLoadingBotResponse}
                                                            style={{ opacity: tempChatEnabled || isLoadingBotResponse ? 0.4 : 1, cursor: tempChatEnabled || isLoadingBotResponse ? 'not-allowed' : 'pointer' }}
                                                        >
                                                            Đổi tên
                                                        </motion.button>
                                                        <motion.button
                                                            whileHover={{ backgroundColor: 'rgba(0,0,0,0.1)' }}
                                                            onClick={() => handleDeleteChat(chat.contextId)}
                                                            className="w-full text-left px-3 py-2 text-red-600 hover:bg-gray-100 transition-colors duration-150 text-sm"
                                                            disabled={tempChatEnabled || isLoadingBotResponse}
                                                            style={{ opacity: tempChatEnabled || isLoadingBotResponse ? 0.4 : 1, cursor: tempChatEnabled || isLoadingBotResponse ? 'not-allowed' : 'pointer' }}
                                                        >
                                                            Xóa
                                                        </motion.button>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                            className="pt-3 border-t border-gray-200 text-center"
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
                    </div>
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
                        ${isDragging ? "bg-blue-50" : ""}
                        relative
                    `}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    {isDragging && (
                        <div className="absolute inset-0 bg-blue-100 bg-opacity-70 flex items-center justify-center z-50 border-2 border-blue-300 border-dashed rounded-lg pointer-events-none">
                            <div className="text-blue-500 text-xl font-semibold">
                                Thả file để tải lên
                            </div>
                        </div>
                    )}
                    <ChatContent
                        contextId={selectedChat}
                        messages={currentMessages}
                        setMessages={setCurrentMessages}
                        isLoadingBotResponse={isLoadingBotResponse}
                    />
                    <div className="p-4 pb-8">
                        <div className="relative max-w-3xl mx-auto md:max-w-4xl">
                            <div className="absolute -top-11 left-2 w-[130px]">
                                <FileListItem files={files} />
                            </div>
                            <motion.textarea
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                value={message}
                                onChange={(e) => {
                                    setMessage(e.target.value);
                                    e.target.style.height = 'auto';
                                    e.target.style.height = `${Math.min(e.target.scrollHeight, 5 * 24)}px`;
                                }}
                                placeholder="Hỏi bất kỳ điều gì"
                                className={`w-full px-8 py-0.5 rounded-full focus:outline-none focus:ring-1 shadow-sm border resize-none min-h-[30px] max-h-[120px] overflow-y-auto scrollbar-hide align-middle text-sm md:px-10 md:py-1 
                                    ${tempChatEnabled
                                        ? "bg-yellow-50 text-amber-900 focus:ring-amber-300 border-amber-200 placeholder-amber-700 temp-chat-active"
                                        : "bg-white text-gray-900 focus:ring-gray-300 border-gray-200 placeholder-gray-500"
                                    }`}
                                style={{
                                    paddingRight: '90px',
                                    ...(tempChatEnabled ? {
                                        animation: 'tempChatPulse 3s infinite ease-in-out'
                                    } : {})
                                }}
                                rows="1"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                                disabled={isLoadingBotResponse}
                            />
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-3">
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.2, delay: 0.0 }}
                                    whileHover={{ scale: isLoadingBotResponse || isMobile ? 1 : 1.3, transition: { duration: 0.2 } }}
                                    whileTap={{ scale: isMobile ? 1 : 0.9, transition: { duration: 0.2 } }}
                                    className={`h-7 w-7 flex items-center justify-center transition-colors duration-150 ${isLoadingBotResponse
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : tempChatEnabled
                                            ? 'text-amber-600 hover:text-amber-800'
                                            : 'text-gray-600 hover:text-black'
                                        }`}
                                    disabled={isLoadingBotResponse}
                                    onClick={() => fileInputRef.current.click()}
                                >
                                    <Paperclip className="h-4 w-4" />
                                </motion.button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={handleFileUpload}
                                    multiple
                                />
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.2, delay: 0.0 }}
                                    whileHover={{ scale: isLoadingBotResponse || isMobile ? 1 : 1.3, transition: { duration: 0.2 } }}
                                    whileTap={{ scale: isMobile ? 1 : 0.9, transition: { duration: 0.2 } }}
                                    className={`h-7 w-7 flex items-center justify-center transition-colors duration-150 ${isLoadingBotResponse
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : tempChatEnabled
                                            ? 'text-amber-600 hover:text-amber-800'
                                            : 'text-gray-600 hover:text-black'
                                        }`}
                                    onClick={handleSendMessage}
                                    disabled={isLoadingBotResponse}
                                >
                                    <Send className="h-4 w-4" />
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {settingsOpen && (
                    <SettingPopup
                        onClose={() => setSettingsOpen(false)}
                        userData={userData}
                        setUserData={setUserData}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Home;