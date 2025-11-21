'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, Image as ImageIcon, File, X, Download } from 'lucide-react';
import clsx from 'clsx';

interface Message {
    id: string;
    text: string;
    sender: string;
    timestamp: string;
    type: 'text' | 'image' | 'file';
    fileData?: string;
    fileName?: string;
}

interface ChatRoomProps {
    roomId: string;
}

export default function ChatRoom({ roomId }: ChatRoomProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [username, setUsername] = useState('');
    const [isJoined, setIsJoined] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Polling logic
    useEffect(() => {
        if (!isJoined) return;

        const fetchMessages = async () => {
            try {
                const lastTimestamp = messages.length > 0 ? messages[messages.length - 1].timestamp : null;
                const url = `/api/chat?roomId=${roomId}${lastTimestamp ? `&after=${lastTimestamp}` : ''}`;
                const res = await fetch(url);
                const data = await res.json();

                if (data.messages && data.messages.length > 0) {
                    setMessages((prev) => {
                        // Merge and deduplicate based on ID
                        const newMessages = [...prev, ...data.messages];
                        const uniqueMessages = Array.from(new Map(newMessages.map(m => [m.id, m])).values());
                        return uniqueMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                    });
                }
            } catch (error) {
                console.error('Polling error:', error);
            }
        };

        // Initial fetch
        fetchMessages();

        // Poll every 2 seconds
        const interval = setInterval(fetchMessages, 2000);
        return () => clearInterval(interval);
    }, [roomId, isJoined, messages.length]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault();
        if (username.trim()) {
            setIsJoined(true);
            // Save username to local storage for persistence across reloads
            localStorage.setItem('chat_username', username);
        }
    };

    useEffect(() => {
        const savedUsername = localStorage.getItem('chat_username');
        if (savedUsername) {
            setUsername(savedUsername);
        }
    }, []);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputText.trim() && !selectedFile) return;

        const tempMessage = inputText;
        const tempFile = selectedFile;
        setInputText('');
        setSelectedFile(null);

        let fileData = null;
        let type = 'text';

        if (tempFile) {
            type = tempFile.type.startsWith('image/') ? 'image' : 'file';
            fileData = await convertToBase64(tempFile);
        }

        try {
            await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roomId,
                    message: tempMessage,
                    sender: username,
                    type,
                    fileData,
                    fileName: tempFile?.name
                }),
            });
            // Immediate fetch to update UI
            // fetchMessages(); // Let polling handle it or optimistic update?
            // Optimistic update could be complex with polling, let's rely on fast polling for now or manual trigger
        } catch (error) {
            console.error('Send error:', error);
        }
    };

    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const convertToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    if (!isJoined) {
        return (
            <div className="flex flex-col items-center justify-center h-full w-full p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-panel p-8 rounded-2xl max-w-md w-full text-center"
                >
                    <h2 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                        Enter the World
                    </h2>
                    <form onSubmit={handleJoin} className="space-y-4">
                        <input
                            type="text"
                            placeholder="Choose your alias..."
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                            autoFocus
                        />
                        <button
                            type="submit"
                            disabled={!username.trim()}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Join Room
                        </button>
                    </form>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full w-full max-w-5xl mx-auto glass-panel rounded-2xl overflow-hidden my-4 md:my-8 relative">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20 backdrop-blur-md z-10">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                    <h1 className="font-bold text-lg tracking-wide">Room: <span className="text-purple-400">{roomId}</span></h1>
                </div>
                <div className="text-xs text-white/50">
                    Open World Chat v1.0
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
                <AnimatePresence initial={false}>
                    {messages.map((msg) => {
                        const isMe = msg.sender === username;
                        return (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className={clsx(
                                    "flex flex-col max-w-[80%]",
                                    isMe ? "self-end items-end" : "self-start items-start"
                                )}
                            >
                                <span className="text-xs text-white/40 mb-1 px-1">{msg.sender}</span>
                                <div
                                    className={clsx(
                                        "p-3 rounded-2xl backdrop-blur-sm border border-white/5 shadow-lg",
                                        isMe
                                            ? "bg-gradient-to-br from-blue-600/80 to-purple-600/80 text-white rounded-tr-none"
                                            : "bg-white/10 text-white rounded-tl-none"
                                    )}
                                >
                                    {msg.type === 'text' && <p className="break-words">{msg.text}</p>}

                                    {msg.type === 'image' && msg.fileData && (
                                        <div className="relative group">
                                            <img
                                                src={msg.fileData}
                                                alt="Shared image"
                                                className="max-w-xs md:max-w-sm rounded-lg border border-white/10"
                                            />
                                            <a
                                                href={msg.fileData}
                                                download={`image-${msg.id}.png`}
                                                className="absolute bottom-2 right-2 p-2 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                                            >
                                                <Download size={16} />
                                            </a>
                                        </div>
                                    )}

                                    {msg.type === 'file' && msg.fileData && (
                                        <div className="flex items-center gap-3 bg-black/20 p-2 rounded-lg min-w-[200px]">
                                            <div className="p-2 bg-white/10 rounded-lg">
                                                <File size={24} className="text-blue-400" />
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <p className="text-sm truncate">{msg.fileName || 'Document'}</p>
                                                <a
                                                    href={msg.fileData}
                                                    download={msg.fileName || `file-${msg.id}`}
                                                    className="text-xs text-blue-300 hover:text-blue-200 hover:underline flex items-center gap-1 mt-1"
                                                >
                                                    <Download size={12} /> Download
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <span className="text-[10px] text-white/20 mt-1 px-1">
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-black/20 backdrop-blur-md border-t border-white/10">
                {selectedFile && (
                    <div className="flex items-center gap-2 mb-2 p-2 bg-white/5 rounded-lg w-fit">
                        <span className="text-xs text-white/70 truncate max-w-[200px]">{selectedFile.name}</span>
                        <button onClick={() => setSelectedFile(null)} className="text-white/50 hover:text-red-400">
                            <X size={14} />
                        </button>
                    </div>
                )}
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                    >
                        <Paperclip size={20} />
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        className="hidden"
                        accept="image/*,.pdf,.doc,.docx,.txt" // Accept images and docs
                    />

                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-white/20"
                    />

                    <button
                        type="submit"
                        disabled={!inputText.trim() && !selectedFile}
                        className="p-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-purple-500/20 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
}
