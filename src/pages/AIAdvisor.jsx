import React, { useState, useRef, useEffect } from 'react';
import { useAssessment } from '../context/AssessmentContext';
import { chatWithAI } from '../services/ai';
import { Bot, User, Send, Loader2, MessageSquare, Trash2 } from 'lucide-react';

const AIAdvisor = () => {
    const { currentAssessment } = useAssessment();
    const [messages, setMessages] = useState([
        {
            role: 'ai',
            content: 'สวัสดีครับ ผมคือ AI Advisor ผู้ช่วยด้านการประเมินผลกระทบสิทธิมนุษยชน (HRIA) มีอะไรให้ผมช่วยไหมครับ?'
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await chatWithAI(userMessage, currentAssessment);
            setMessages(prev => [...prev, { role: 'ai', content: response }]);
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'ai',
                content: 'ขออภัย เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI โปรดลองใหม่อีกครั้ง'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const clearHistory = () => {
        if (window.confirm('คุณต้องการลบประวัติการสนทนาทั้งหมดใช่หรือไม่?')) {
            setMessages([
                {
                    role: 'ai',
                    content: 'สวัสดีครับ ผมคือ AI Advisor ผู้ช่วยด้านการประเมินผลกระทบสิทธิมนุษยชน (HRIA) มีอะไรให้ผมช่วยไหมครับ?'
                }
            ]);
        }
    };

    return (
        <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Bot className="text-blue-600" /> ที่ปรึกษา AI (AI Advisor)
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        ปรึกษาปัญหา ข้อสงสัย หรือขอคำแนะนำเกี่ยวกับการทำ HRIA
                    </p>
                </div>
                <button
                    onClick={clearHistory}
                    className="text-gray-400 hover:text-red-500 transition-colors p-2"
                    title="ลบประวัติการสนทนา"
                >
                    <Trash2 size={20} />
                </button>
            </div>

            {/* Chat Container */}
            <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
                                }`}>
                                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                            </div>
                            <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${msg.role === 'user'
                                    ? 'bg-blue-600 text-white rounded-tr-none'
                                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                                }`}>
                                <p className="leading-relaxed whitespace-pre-wrap text-sm">{msg.content}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center shrink-0">
                                <Bot size={20} />
                            </div>
                            <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-2">
                                <Loader2 size={16} className="animate-spin text-gray-400" />
                                <span className="text-gray-400 text-sm">กำลังพิมพ์...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-gray-100">
                    <form onSubmit={handleSend} className="flex gap-3">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="พิมพ์ข้อความของคุณที่นี่..."
                            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium shadow-sm"
                        >
                            <Send size={18} />
                            <span className="hidden sm:inline">ส่งข้อความ</span>
                        </button>
                    </form>
                    <p className="text-center text-xs text-gray-400 mt-3">
                        AI อาจแสดงข้อมูลที่ไม่ถูกต้อง โปรดตรวจสอบข้อมูลสำคัญอีกครั้ง
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AIAdvisor;
