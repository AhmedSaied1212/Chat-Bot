import React, { useState, useEffect, useRef } from 'react';
import { PaperAirplaneIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import Prism from 'prismjs';
import { useNavigate } from 'react-router-dom';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-python';

const Chatbot = () => {
    const [message, setMessage] = useState("");
    const [conversation, setConversation] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const chatContainerRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [conversation]);

    // Helper: parse fenced code blocks and return array of text / code parts
    const parseMessageParts = (text) => {
        const parts = [];
        let lastIndex = 0;
        const regex = /```([a-zA-Z0-9-_]*)\n([\s\S]*?)```/g;
        let match;
        while ((match = regex.exec(text)) !== null) {
            const idx = match.index;
            if (idx > lastIndex) {
                parts.push({ type: 'text', content: text.slice(lastIndex, idx) });
            }
            parts.push({ type: 'code', lang: match[1] || 'txt', content: match[2] });
            lastIndex = regex.lastIndex;
        }
        if (lastIndex < text.length) {
            parts.push({ type: 'text', content: text.slice(lastIndex) });
        }
        return parts;
    };

    const CodeViewer = ({ code, lang = 'text' }) => {
        const [copied, setCopied] = useState(false);
        const codeRef = useRef(null);

        useEffect(() => {
            if (codeRef.current) {
                try {
                    Prism.highlightElement(codeRef.current);
                } catch (e) {
                    // ignore
                }
            }
        }, [code, lang]);

        const handleCopy = async () => {
            try {
                await navigator.clipboard.writeText(code);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (e) {
                console.error('Copy failed', e);
            }
        };

        return (
            <div className="mt-3 w-full bg-gray-900 rounded-lg overflow-hidden border border-gray-800 shadow">
                <div className="flex items-center justify-between px-3 py-2 bg-gray-800 border-b border-gray-700">
                    <div className="text-xs text-gray-300 font-medium">{lang}</div>
                    <button onClick={handleCopy} className="text-xs text-gray-200 bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded">
                        {copied ? 'Copied' : 'Copy'}
                    </button>
                </div>
                <pre className={`language-${lang} m-0 p-3 overflow-auto`}>
                    <code ref={codeRef} className={`language-${lang}`}>
                        {code}
                    </code>
                </pre>
            </div>
        );
    };

    const sendMessage = async () => {
        if (!message.trim()) return;

        const userMessage = { sender: 'user', text: message };
        setConversation(prev => [...prev, userMessage]);
        setMessage("");
        setLoading(true);
        setError(null);

        try {
            const API_BASE = import.meta.env.VITE_API || 'http://localhost:3000'
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_BASE}/chatBot`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    message: message
                })
            });

            if (!response.ok) {
                if (response.status === 401) {
                    // token missing/invalid -> redirect to login
                    setError('Session expired or unauthorized. Redirecting to login...');
                    setTimeout(() => navigate('/auth'), 800);
                    return;
                }
                // try parse json error, otherwise use status text
                let errText = `HTTP error! status: ${response.status}`
                try {
                    const errorData = await response.json();
                    errText = errorData.error || errorData.message || JSON.stringify(errorData)
                } catch (e) {
                    errText = response.statusText || errText
                }
                throw new Error(errText)
            }

            const data = await response.json();
            const botResponse = { sender: 'bot', text: data.data };
            setConversation(prev => [...prev, botResponse]);
            // console.log(data); // يمكنك إلغاء التعليق لرؤية البيانات كاملة في الكونسول

        } catch (err) {
            console.error("❌ Error sending message:", err);
            setError("Error in sending message !");
            setConversation(prev => [...prev, { sender: 'system', text: 'Error in connect or failed to send response' }]);
        } finally {
            setLoading(false);
        }
    };

    // Load chat history from backend on mount
    useEffect(() => {
    const loadHistory = async () => {
            try {
        const API_BASE = import.meta.env.VITE_API || 'http://localhost:3000'
    const token = localStorage.getItem('token')
    const res = await fetch(`${API_BASE}/chatBot`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
                if (!res.ok) return;
                const json = await res.json();
                if (json && json.data) {
                    // map to local conversation shape: sender/text
                    const conv = json.data.map(item => ({ sender: item.role === 'user' ? 'user' : item.role === 'bot' ? 'bot' : 'system', text: item.message }));
                    setConversation(conv);
                }
            } catch (e) {
                // ignore load errors for now
                console.error('Failed to load history', e);
                // if 401, redirect to auth; otherwise log
                if (e && e.message && e.message.toLowerCase().includes('401')) {
                    setError('Session expired. Redirecting to login...')
                    setTimeout(() => navigate('/auth'), 800)
                    return
                }
            }
        };

        loadHistory();
    }, []);

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !loading && message.trim()) { // أضفنا التحقق من message.trim() هنا أيضًا
            sendMessage();
        }
    };

    return (
        <div className="font-sans min-h-screen w-full mx-auto mt-0 p-6 bg-gradient-to-br from-gray-50 to-white space-y-4">
            <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-6 tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                    Your Smart Assistant
                </span>
            </h2>

            {/* chat area (open) */}
            <div ref={chatContainerRef} className="w-full h-[70vh] overflow-y-auto p-4 bg-transparent shadow-none flex flex-col space-y-3 custom-scrollbar">
                {conversation.length === 0 && (
                    <p className="text-center text-gray-500 italic py-10">Start a conversation!</p>
                )}

                {conversation.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                            <div className={`inline-block p-3 rounded-xl text-base break-words ${
                                msg.sender === 'user'
                                    ? 'bg-blue-600 text-white rounded-br-none shadow-md'
                                    : msg.sender === 'bot'
                                    ? 'bg-gray-100 text-gray-800 rounded-bl-none shadow-md'
                                    : 'bg-red-50 text-red-700 border border-red-300 rounded-md text-sm italic'
                            }`}>
                                {msg.sender === 'bot' && typeof msg.text === 'string' && msg.text.includes('```') ? (
                                    // render text + code blocks
                                    parseMessageParts(msg.text).map((part, i) => (
                                        part.type === 'text' ? (
                                            <span key={i} className="whitespace-pre-wrap">{part.content}</span>
                                        ) : (
                                            <CodeViewer key={i} code={part.content} lang={part.lang} />
                                        )
                                    ))
                                ) : (
                                    msg.text
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-center py-2">
                        <ArrowPathIcon className="h-6 w-6 text-blue-500 animate-spin" />
                        <p className="ml-2 text-gray-600 italic">thinking..</p>
                    </div>
                )}
                {error && (
                    <div className="text-center p-2 text-red-600 font-medium bg-red-100 rounded-md border border-red-200">
                        Error: {error}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-3 justify-center">
                <input
                    type="text"
                    placeholder='Ask me for any thing...'
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                    className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:text-gray-500 placeholder-gray-400"
                />
                <button
                    onClick={sendMessage}
                    disabled={loading || !message.trim()}
                    className="flex items-center justify-center px-5 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500"
                >
                    {loading ? (
                        <ArrowPathIcon className="h-5 w-5 animate-spin mr-2" />
                    ) : (
                        <PaperAirplaneIcon className="h-5 w-5 rotate-90 mr-2" />
                    )}
                    {loading ? 'sending...' : 'send'}
                </button>
            </div>
        </div>
    );
};

export default Chatbot;