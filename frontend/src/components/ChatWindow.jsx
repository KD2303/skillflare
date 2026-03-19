import { useState, useEffect, useRef } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { chatService } from '../services/chatService';
import Avatar from './Avatar';
import { formatTime, formatRelativeTime } from '../utils/helpers';
import toast from 'react-hot-toast';

const ChatWindow = ({ taskId, chatRoomId }) => {
  const { user } = useAuth();
  const { socket, joinChatRoom, leaveChatRoom, sendMessage: socketSendMessage } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [chatRoom, setChatRoom] = useState(null);
  const [typingUser, setTypingUser] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    loadChat();

    return () => {
      if (chatRoomId) {
        leaveChatRoom(chatRoomId);
      }
    };
  }, [taskId, chatRoomId]);

  useEffect(() => {
    if (chatRoomId && socket) {
      joinChatRoom(chatRoomId);

      // Listen for new messages
      socket.on('chat:newMessage', (message) => {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();
      });

      // Listen for typing indicators
      socket.on('chat:userTyping', (typingUserData) => {
        if (typingUserData._id !== user._id) {
          setTypingUser(typingUserData);
        }
      });

      socket.on('chat:userStopTyping', () => {
        setTypingUser(null);
      });

      return () => {
        socket.off('chat:newMessage');
        socket.off('chat:userTyping');
        socket.off('chat:userStopTyping');
      };
    }
  }, [chatRoomId, socket, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChat = async () => {
    try {
      setLoading(true);
      let response;
      if (chatRoomId) {
        response = await chatService.getChatRoom(chatRoomId);
      } else if (taskId) {
        response = await chatService.getChatByTask(taskId);
      }
      
      if (response?.chatRoom) {
        setChatRoom(response.chatRoom);
        setMessages(response.chatRoom.messages || []);
        
        // Mark messages as read
        if (response.chatRoom._id) {
          await chatService.markAsRead(response.chatRoom._id);
        }
      }
    } catch (error) {
      console.error('Error loading chat:', error);
      if (error.response?.status !== 404) {
        toast.error('Failed to load chat');
      }
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatRoom?._id) return;

    try {
      setSending(true);
      const response = await chatService.sendMessage(chatRoom._id, newMessage.trim());
      
      // Add message to local state
      setMessages((prev) => [...prev, response.message]);
      
      // Send via socket for real-time update to others
      socketSendMessage(chatRoom._id, response.message);
      
      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleTyping = () => {
    if (socket && chatRoom?._id) {
      socket.emit('chat:typing', {
        chatRoomId: chatRoom._id,
        user: { _id: user._id, name: user.name },
      });

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('chat:stopTyping', {
          chatRoomId: chatRoom._id,
          user: { _id: user._id },
        });
      }, 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-brand-orange animate-spin" />
      </div>
    );
  }

  if (!chatRoom) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-brand-text-muted bg-brand-surface/20 rounded-xl border border-dashed border-brand-border">
        <MessageSquare size={48} className="mb-4 opacity-20" />
        <p className="font-bold">Encrypted Channel Offline</p>
        <p className="text-sm mt-2">Chat will activate once a student accepts this mission.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-brand-dark/40 overflow-hidden">
      {/* Chat header */}
      <div className="px-6 py-4 bg-brand-surface/80 backdrop-blur-md border-b border-brand-border relative z-10">
        <div className="flex items-center space-x-3">
          {chatRoom.participants
            ?.filter((p) => p._id !== user._id)
            .map((participant) => (
              <div key={participant._id} className="flex items-center space-x-3">
                <div className="relative">
                  <Avatar name={participant.name} src={participant.avatar} size="small" className="ring-2 ring-brand-orange/20" />
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-brand-dark"></div>
                </div>
                <div>
                  <p className="font-bold text-white text-sm leading-none mb-1">
                    {participant.name}
                  </p>
                  <span className={`text-[9px] font-black uppercase tracking-widest ${
                    participant.role === 'teacher' ? 'text-blue-400' : 'text-brand-orange'
                  }`}>
                    {participant.role === 'teacher' ? 'Instructor' : 'Field Agent'}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-dots-pattern">
        {messages.map((message, index) => {
          const isOwnMessage = message.sender?._id === user._id || message.sender === user._id;
          const isSystemMessage = message.messageType === 'system';

          if (isSystemMessage) {
            return (
              <div key={message._id || index} className="flex justify-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted bg-white/5 border border-white/5 px-4 py-1 rounded-full backdrop-blur-sm">
                  {message.content}
                </span>
              </div>
            );
          }

          return (
            <div
              key={message._id || index}
              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : 'flex-row'} items-end space-x-3 max-w-[85%]`}>
                {!isOwnMessage && (
                  <Avatar
                    name={message.sender?.name || 'User'}
                    src={message.sender?.avatar}
                    size="small"
                    className="flex-shrink-0 mb-1"
                  />
                )}
                <div
                  className={`relative px-4 py-3 shadow-xl ${
                    isOwnMessage
                      ? 'bg-brand-orange text-white rounded-2xl rounded-br-none'
                      : 'bg-brand-surface border border-brand-border text-white rounded-2xl rounded-bl-none'
                  }`}
                >
                  <p className="text-sm font-medium leading-relaxed break-words">{message.content}</p>
                  <div className="flex items-center justify-end space-x-1 mt-1 opacity-60">
                    <span className="text-[9px] font-bold uppercase tracking-tighter">
                      {formatTime(message.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {typingUser && (
          <div className="flex items-center space-x-3 text-brand-text-muted animate-pulse">
            <div className="flex space-x-1">
               <div className="w-1 h-1 bg-brand-orange rounded-full animate-bounce"></div>
               <div className="w-1 h-1 bg-brand-orange rounded-full animate-bounce delay-100"></div>
               <div className="w-1 h-1 bg-brand-orange rounded-full animate-bounce delay-200"></div>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">{typingUser.name} is drafting...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      {chatRoom.isActive !== false && (
        <form
          onSubmit={handleSendMessage}
          className="p-4 bg-brand-surface/90 border-t border-brand-border backdrop-blur-md"
        >
          <div className="flex space-x-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              placeholder="Send an encrypted message..."
              className="flex-1 bg-brand-dark border border-brand-border p-3 rounded-xl text-sm text-white focus:border-brand-orange outline-none transition-all placeholder:text-brand-text-muted font-medium"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className={`p-3 rounded-xl transition-all flex items-center justify-center ${
                !newMessage.trim() || sending 
                  ? 'bg-white/5 text-brand-text-muted' 
                  : 'bg-brand-orange text-white shadow-glow'
              }`}
            >
              {sending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send size={20} />
              )}
            </button>
          </div>
        </form>
      )}

      {chatRoom.isActive === false && (
        <div className="p-6 bg-brand-surface/50 border-t border-brand-border text-center text-red-400 font-black uppercase tracking-widest text-xs backdrop-blur-sm">
          Channel terminated by task controller
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
