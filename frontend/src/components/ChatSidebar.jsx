import { useState, useRef, useEffect } from 'react';
import { studyKitService } from '../services/studyKitService';
import { Send, X, MessageCircle, Bot, User } from 'lucide-react';

function ChatSidebar({ documentId, isOpen, onClose }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        const trimmed = input.trim();
        if (!trimmed || loading) return;

        const userMessage = { role: 'user', content: trimmed };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const data = await studyKitService.chatWithDocument(documentId, trimmed);
            setMessages(prev => [...prev, { role: 'ai', content: data.response }]);
        } catch {
            setMessages(prev => [...prev, { role: 'ai', content: 'Sorry, I encountered an error. Please try again.' }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* Backdrop */}
            {isOpen && <div className="chat-sidebar-backdrop" onClick={onClose} />}

            <aside className={`chat-sidebar ${isOpen ? 'open' : ''}`}>
                {/* Header */}
                <div className="chat-sidebar-header">
                    <div className="chat-sidebar-title">
                        <MessageCircle size={20} />
                        <span>AI Tutor</span>
                    </div>
                    <button onClick={onClose} className="chat-close-btn" aria-label="Close chat">
                        <X size={20} />
                    </button>
                </div>

                {/* Messages */}
                <div className="chat-messages">
                    {messages.length === 0 && (
                        <div className="chat-empty">
                            <Bot size={40} />
                            <p>Ask me anything about your uploaded material!</p>
                        </div>
                    )}
                    {messages.map((msg, i) => (
                        <div key={i} className={`chat-bubble chat-bubble-${msg.role}`}>
                            <div className="chat-bubble-icon">
                                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                            </div>
                            <div className="chat-bubble-content">
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="chat-bubble chat-bubble-ai">
                            <div className="chat-bubble-icon"><Bot size={16} /></div>
                            <div className="chat-bubble-content chat-typing">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="chat-input-area">
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask about your material..."
                        rows={1}
                        className="chat-input"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || loading}
                        className="chat-send-btn"
                        aria-label="Send message"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </aside>
        </>
    );
}

export default ChatSidebar;
