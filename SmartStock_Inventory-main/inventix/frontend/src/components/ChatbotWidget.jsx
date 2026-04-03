import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import * as chatbotService from '../services/chatbotService';
import clsx from 'clsx';

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi! I'm your Inventix AI Assistant. Ask me anything about your inventory!", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Draggable state
  const [position, setPosition] = useState({ x: null, y: null });
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const buttonRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Initialize position to bottom-right
  useEffect(() => {
    setPosition({ x: window.innerWidth - 80, y: window.innerHeight - 80 });
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Drag handlers
  const onMouseDown = (e) => {
    setDragging(true);
    dragOffset.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    e.preventDefault();
  };
  useEffect(() => {
    const onMouseMove = (e) => {
      if (!dragging) return;
      setPosition({
        x: Math.max(0, Math.min(window.innerWidth - 60, e.clientX - dragOffset.current.x)),
        y: Math.max(0, Math.min(window.innerHeight - 60, e.clientY - dragOffset.current.y))
      });
    };
    const onMouseUp = () => setDragging(false);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => { document.removeEventListener('mousemove', onMouseMove); document.removeEventListener('mouseup', onMouseUp); };
  }, [dragging]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { text: userMsg, isBot: false }]);
    setInput('');
    setLoading(true);

    try {
      const res = await chatbotService.askChatbot(userMsg);
      setMessages(prev => [...prev, { text: res.data.reply, isBot: true }]);
    } catch (error) {
      console.error("Chatbot API Error:", error);
      setMessages(prev => [...prev, { text: "Sorry, I couldn't fetch the data right now. Please check your connection.", isBot: true }]);
    } finally {
      setLoading(false);
    }
  };

  if (position.x === null) return null;

  // Chat window position (opens above and to the left of the button)
  const chatLeft = Math.max(8, Math.min(position.x - 370, window.innerWidth - 400));
  const chatTop = Math.max(8, position.y - 460);

  return (
    <>
      {/* Chat window (fixed position based on button) */}
      {isOpen && (
        <div
          className="surface-strong fixed z-50 w-[380px] h-[450px] rounded-[1.75rem] flex flex-col overflow-hidden"
          style={{ left: chatLeft, top: chatTop }}
        >
          <div className="bg-[linear-gradient(135deg,#4a7fa7_0%,#1a3d63_52%,#0a1931_100%)] p-4 text-white flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#f6fafd] animate-pulse" />
              <span className="font-semibold">Inventix AI</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-transparent">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`text-sm px-4 py-2.5 rounded-2xl max-w-[85%] shadow-sm ${
                  msg.isBot
                    ? 'surface text-[color:var(--text)] rounded-bl-sm'
                    : 'bg-primary-500 text-white rounded-br-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="surface rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-[color:var(--line)] flex gap-2 shrink-0">
            <input
              type="text"
              className="input-shell flex-1 rounded-full px-4 text-sm h-10"
              placeholder="Ask anything about inventory..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <button onClick={handleSend} disabled={!input.trim() || loading}
              className="w-10 h-10 shrink-0 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white rounded-full flex items-center justify-center transition-colors">
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </div>
      )}

      <div
        ref={buttonRef}
        style={{ position: 'fixed', left: position.x - 28, top: position.y - 28, zIndex: 9999, cursor: dragging ? 'grabbing' : 'grab' }}
        onMouseDown={onMouseDown}
        onClick={() => !dragging && setIsOpen(!isOpen)}
        className={clsx(
          "w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg select-none transition-transform",
          "bg-[linear-gradient(135deg,#4a7fa7_0%,#1a3d63_52%,#0a1931_100%)] hover:scale-110",
          dragging && 'scale-110'
        )}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </div>
    </>
  );
}
