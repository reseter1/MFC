import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './FileListItem.css';

export default function FileListItem() {
    const [files, setFiles] = useState([
        { mimetype: "text/plain", name: "document.txt" },
        { mimetype: "image/jpeg", name: "photo.jpg" },
        { mimetype: "application/pdf", name: "report.pdf" }
    ]);
    const [isExpanded, setIsExpanded] = useState(false);

    if (files.length === 0) {
        return null;
    }

    return (
        <div className="file-list-container">
            <div className="file-list-wrapper">
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            className="w-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-2"
                            initial={{ opacity: 0, y: 20, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: 20, height: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {files.map((file, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{
                                        backgroundColor: 'rgba(0,0,0,0.05)',
                                        boxShadow: '0 0 8px 2px rgba(0, 0, 0, 0.1)'
                                    }}
                                    className="flex items-center px-3 py-2 border-b border-gray-100 last:border-b-0 transition-colors duration-150 rounded-sm"
                                >
                                    <div className="mr-2.5">
                                        {file.mimetype.includes('image') ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-2.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        ) : file.mimetype.includes('pdf') ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        )}
                                    </div>
                                    <span
                                        className="text-sm text-gray-900 flex-1 truncate filename"
                                        title={file.name}
                                    >
                                        {file.name}
                                    </span>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <motion.button
                className="expand-button"
                onClick={() => setIsExpanded(!isExpanded)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                <div className="button-content">
                    <span className="button-text">Danh sách tệp</span>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-4 w-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </motion.button>
        </div>
    );
}