import { useState, useEffect, useRef } from 'react';
import { Send, X, MessageSquare, Loader2 } from 'lucide-react';
import { io } from 'socket.io-client';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { formatRelativeDate } from '../../utils/formatters';

export default function MessagingWidget({ applicationId, applicantName, onClose }) {
  const { user } = useAuth();
  const { error } = useToast();
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (applicationId) {
      fetchMessages();
      connectSocket();
    }
    
    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave_application_room', applicationId);
        socketRef.current.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/messages/${applicationId}`);
      setMessages(res.data.data.messages);
    } catch (err) {
      error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const connectSocket = () => {
    // We assume the auth token is stored in cookies, or we can fetch it if needed. 
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const socketUrl = import.meta.env.VITE_SOCKET_URL || apiUrl.replace(/\/api\/?$/, '');
    const token = localStorage.getItem('token');
    
    socketRef.current = io(socketUrl, {
      withCredentials: true,
      auth: {
        token
      }
    });

    socketRef.current.on('connect', () => {
      socketRef.current.emit('join_application_room', applicationId);
    });

    socketRef.current.on('new_message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socketRef.current.on('typing', ({ userId, isTyping: typingStatus }) => {
      if (userId !== user._id) {
        setIsTyping(typingStatus);
      }
    });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      setSending(true);
      const res = await api.post(`/messages/${applicationId}`, { content: newMessage });
      // Message is appended via socket 'new_message' event!
      setNewMessage('');
      socketRef.current.emit('typing', { applicationId, isTyping: false });
    } catch (err) {
      error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (socketRef.current) {
      socketRef.current.emit('typing', { applicationId, isTyping: true });
      
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current.emit('typing', { applicationId, isTyping: false });
      }, 2000);
    }
  };

  return (
    <>
      {/* Chat Window */}
      <Card className="fixed bottom-6 right-6 w-80 sm:w-96 max-h-[500px] flex flex-col shadow-2xl z-50 overflow-hidden border border-slate-200 dark:border-slate-800 rounded-2xl animate-fade-in">
        {/* Header */}
        <div className="bg-primary-600 text-white p-4 flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight">
                {applicantName ? applicantName : 'Chat'}
              </h3>
              <p className="text-[10px] text-primary-100 uppercase tracking-wider font-semibold">Application Chat</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-primary-100 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-colors focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

          {/* Message List */}
          <div className="flex-1 p-4 overflow-y-auto bg-slate-50 dark:bg-slate-900 min-h-[300px]">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">No messages yet.</p>
                <p className="text-xs">Start the conversation!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, idx) => {
                  const isMine = msg.sender._id === user._id;
                  return (
                    <div key={msg._id || idx} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                      <div 
                        className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                          isMine 
                            ? 'bg-primary-600 text-white rounded-br-none' 
                            : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-bl-none'
                        }`}
                      >
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 px-1">
                        {formatRelativeDate(msg.createdAt)}
                      </span>
                    </div>
                  );
                })}
                {isTyping && (
                  <div className="flex items-start">
                    <div className="bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-2xl rounded-bl-none text-xs italic flex items-center gap-1">
                      <span className="animate-bounce">.</span><span className="animate-bounce delay-75">.</span><span className="animate-bounce delay-150">.</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
            <form onSubmit={handleSendMessage} className="flex items-end gap-2">
              <textarea
                value={newMessage}
                onChange={handleTyping}
                placeholder="Type a message..."
                className="flex-1 input-field resize-none max-h-32 min-h-[40px] py-2 text-sm"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
              <Button 
                type="submit" 
                size="sm" 
                className="h-10 w-10 px-0 flex items-center justify-center rounded-full flex-shrink-0"
                disabled={sending || !newMessage.trim()}
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 -ml-0.5 mt-0.5" />}
              </Button>
            </form>
          </div>
      </Card>
    </>
  );
}
