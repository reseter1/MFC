import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Volume2 } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { setVoiceSettings, selectVoiceSettings } from '../store/slices/voiceSettingsSlice';
import { useToast } from './ToastProvider';
import { API_URL } from '../data/constant';
import { useNavigate } from 'react-router-dom';
const SettingPopup = ({ onClose, userData, setUserData }) => {
    const dispatch = useDispatch();
    const voiceSettings = useSelector(selectVoiceSettings);
    const { addToast } = useToast();
    const [activeTab, setActiveTab] = useState('user');
    const [displayName, setDisplayName] = useState(userData?.displayName || '');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const [language, setLanguage] = useState(voiceSettings.language);
    const [voice, setVoice] = useState(voiceSettings.voice);
    const [speed, setSpeed] = useState(voiceSettings.speed);

    const handleChangeDisplayName = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/user/update-user-display-name`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ DisplayName: displayName })
            });
            const data = await response.json();
            if (data.success) {
                addToast('Đã thay đổi tên hiển thị thành công!', 'success');
                setUserData({ ...userData, displayName: displayName });
            } else {
                addToast('Đã xảy ra lỗi khi thay đổi tên hiển thị: ' + data.message, 'error');
            }
        } catch (error) {
            addToast('Đã xảy ra lỗi khi thay đổi tên hiển thị: ' + error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangePassword = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/user/update-user-password`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ OldPassword: oldPassword, NewPassword: newPassword })
            });
            const data = await response.json();
            if (data.success) {
                addToast('Đã thay đổi mật khẩu thành công!', 'success');
                setOldPassword('');
                setNewPassword('');
            } else {
                addToast('Đã xảy ra lỗi khi thay đổi mật khẩu: ' + data.message, 'error');
            }
        } catch (error) {
            addToast('Đã xảy ra lỗi khi thay đổi mật khẩu: ' + error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveVoiceSettings = () => {
        dispatch(setVoiceSettings({ language, voice, speed }));
        addToast('Đã lưu cài đặt giọng nói!', 'success');
    };

    const handleDeleteChats = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/user/delete-user-chats`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                }
            });
            const data = await response.json();
            if (data.success) {
                addToast('Đã xóa toàn bộ đoạn chat!', 'success');
                window.location.reload();
            }
        } catch (error) {
            addToast('Đã xảy ra lỗi khi xóa toàn bộ đoạn chat: ' + error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/user/delete-account`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                }
            });
            const data = await response.json();
            if (data.success) {
                addToast('Đã xóa tài khoản thành công!', 'success');
                navigate('/logout');
            } else {
                addToast('Đã xảy ra lỗi khi xóa tài khoản: ' + data.message, 'error');
            }
        } catch (error) {
            addToast('Đã xảy ra lỗi khi xóa tài khoản: ' + error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const tabContent = {
        user: {
            title: 'Cài đặt người dùng',
            content: (
                <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                        <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden">
                            <img
                                src={'https://openfxt.vercel.app/images/favicon.png'}
                                alt="Avatar"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div>
                            <h3 className="font-medium text-base">{userData?.displayName || 'Người dùng'}</h3>
                            <p className="text-xs text-gray-500">@{userData?.username || 'username'}</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-xs font-medium text-gray-700">Tên hiển thị</label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            disabled={isLoading}
                            className="w-full px-3 py-1.5 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300 text-sm bg-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            placeholder="Nhập tên hiển thị"
                        />
                        <button
                            onClick={handleChangeDisplayName}
                            disabled={isLoading}
                            className="px-3 py-1.5 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Đang xử lý...' : 'Thay đổi tên'}
                        </button>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-gray-100">
                        <label className="block text-xs font-medium text-gray-700">Thông tin tài khoản</label>
                        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded-md">
                            <p>Tên người dùng: @{userData?.username || 'username'}</p>
                            <p>Email: {userData?.email || 'email@example.com'}</p>
                        </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-gray-100">
                        <label className="block text-xs font-medium text-gray-700">Thay đổi mật khẩu</label>
                        <input
                            type="password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            disabled={isLoading}
                            placeholder="Mật khẩu cũ"
                            className="w-full px-3 py-1.5 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300 text-sm bg-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            disabled={isLoading}
                            placeholder="Mật khẩu mới"
                            className="w-full px-3 py-1.5 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300 text-sm bg-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <button
                            onClick={handleChangePassword}
                            disabled={isLoading}
                            className="px-3 py-1.5 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Thay đổi mật khẩu
                        </button>
                    </div>
                </div>
            )
        },
        voice: {
            title: 'Cài đặt giọng nói',
            content: (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="block text-xs font-medium text-gray-700">Ngôn ngữ</label>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full px-3 py-1.5 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300 text-sm bg-white shadow-sm"
                        >
                            <option value="vi">Tiếng Việt</option>
                            <option value="en">Tiếng Anh</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-xs font-medium text-gray-700">Giọng nói</label>
                        <select
                            value={voice}
                            onChange={(e) => setVoice(e.target.value)}
                            className="w-full px-3 py-1.5 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300 text-sm bg-white shadow-sm"
                        >
                            <option value="1">Giọng 1</option>
                            <option value="2">Giọng 2</option>
                            <option value="3">Giọng 3</option>
                            <option value="4">Giọng 4</option>
                            <option value="5">Giọng 5</option>
                            <option value="6">Giọng 6</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-xs font-medium text-gray-700">Tốc độ</label>
                        <select
                            value={speed}
                            onChange={(e) => setSpeed(e.target.value)}
                            className="w-full px-3 py-1.5 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300 text-sm bg-white shadow-sm"
                        >
                            <option value="0.5">0.5x</option>
                            <option value="0.75">0.75x</option>
                            <option value="1.0">1.0x</option>
                            <option value="1.5">1.5x</option>
                            <option value="1.75">1.75x</option>
                            <option value="2.0">2.0x</option>
                        </select>
                    </div>

                    <button
                        onClick={handleSaveVoiceSettings}
                        disabled={isLoading}
                        className="px-3 py-1.5 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Lưu cài đặt
                    </button>
                </div>
            )
        },
        security: {
            title: 'Bảo mật',
            content: (
                <div className="space-y-4">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-2 border border-gray-200 rounded-md bg-gray-50">
                            <div>
                                <h4 className="font-medium text-sm">Xóa toàn bộ đoạn chat</h4>
                                <p className="text-xs text-gray-500">Hành động này không thể hoàn tác</p>
                            </div>
                            <button
                                onClick={handleDeleteChats}
                                disabled={isLoading}
                                className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Thực hiện
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-2 border border-red-200 rounded-md bg-red-50">
                            <div>
                                <h4 className="font-medium text-sm text-red-700">Xóa tài khoản</h4>
                                <p className="text-xs text-red-600">Xóa vĩnh viễn tài khoản của bạn và tất cả dữ liệu</p>
                            </div>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={isLoading}
                                className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Thực hiện
                            </button>
                        </div>
                    </div>
                </div>
            )
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-3"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white rounded-md max-w-lg w-full max-h-[80vh] overflow-y-auto scrollbar-hide"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex border-b border-gray-100">
                    <button
                        onClick={() => setActiveTab('user')}
                        className={`flex-1 p-3 text-center font-medium text-sm ${activeTab === 'user' ? 'bg-gray-50 border-b-2 border-gray-800' : 'text-gray-500 hover:bg-gray-50'
                            }`}
                    >
                        <User className="w-3.5 h-3.5 inline mr-1" />
                        Người dùng
                    </button>
                    <button
                        onClick={() => setActiveTab('voice')}
                        className={`flex-1 p-3 text-center font-medium text-sm ${activeTab === 'voice' ? 'bg-gray-50 border-b-2 border-gray-800' : 'text-gray-500 hover:bg-gray-50'
                            }`}
                    >
                        <Volume2 className="w-3.5 h-3.5 inline mr-1" />
                        Giọng nói
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`flex-1 p-3 text-center font-medium text-sm ${activeTab === 'security' ? 'bg-gray-50 border-b-2 border-gray-800' : 'text-gray-500 hover:bg-gray-50'
                            }`}
                    >
                        <Lock className="w-3.5 h-3.5 inline mr-1" />
                        Bảo mật
                    </button>
                </div>

                <div className="p-4">
                    <h2 className="text-lg font-semibold mb-3">{tabContent[activeTab].title}</h2>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {tabContent[activeTab].content}
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="p-3 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
                    >
                        Đóng
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default SettingPopup; 