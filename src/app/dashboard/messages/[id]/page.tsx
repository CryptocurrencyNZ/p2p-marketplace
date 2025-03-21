"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Send, 
  PaperclipIcon, 
  MoreVertical, 
  Star, 
  Phone, 
  Video,
  Clock,
  Check,
  CheckCheck,
  Copy,
  ExternalLink,
  Shield,
  AlertCircle,
  FileText
} from 'lucide-react';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  status: string;
  isFile?: boolean;
  fileType?: string;
  fileName?: string;
  fileSize?: string;
}

interface ChatUser {
  name: string;
  address: string;
  avatar: string;
  status: string;
  lastSeen: string;
  verified: boolean;
}

interface ChatData {
  id: string;
  user: ChatUser;
  messages: Message[];
  starred: boolean;
  encrypted: boolean;
  verified: boolean;
}

const ChatRoom = () => {
  const router = useRouter();
  const { id: chatId } = useParams() as { id: string };
  
  // References
  const messageInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // State for chat data
  const [currentChat, setCurrentChat] = useState<ChatData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Fetch chat data from API
  useEffect(() => {
    const fetchChatData = async () => {
      try {
        setLoading(true);
        // Current user - in production this would come from auth
        const currentUser = "buyer123"; // Default user for demo
        
        const response = await fetch(`/api/chats/${chatId}?userId=${currentUser}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch chat data');
        }
        
        const data = await response.json();
        setCurrentChat(data);
        setMessages(data.messages || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching chat data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    if (chatId) {
      fetchChatData();
    }
  }, [chatId]);
  
  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Mark messages as read when chat is opened
  useEffect(() => {
    const markMessagesAsRead = async () => {
      if (!chatId) return;
      
      try {
        // Current user - in production this would come from auth
        const currentUser = "buyer123"; // Default user for demo
        
        await fetch(`/api/chats/${chatId}/read`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: currentUser
          }),
        });
      } catch (err) {
        console.error('Error marking messages as read:', err);
      }
    };
    
    if (currentChat) {
      markMessagesAsRead();
    }
  }, [chatId, currentChat]);
  
  // Handle sending a message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() === '') return;
    
    // Add new message to the list with "sending" status
    const tempId = `temp-${Date.now()}`;
    const newMessage: Message = {
      id: tempId,
      sender: 'me',
      content: message,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "sending",
    };
    
    setMessages(prev => [...prev, newMessage]);
    setMessage('');
    
    // Focus back on input after sending
    messageInputRef.current?.focus();
    
    try {
      // Send message to API
      const response = await fetch('/api/chats/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId,
          sender: 'buyer123', // Current user - in production this would come from auth
          content: newMessage.content
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      const data = await response.json();
      
      // Replace the temporary message with the one from the server
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempId ? data.message : msg
        )
      );
    } catch (err) {
      console.error('Error sending message:', err);
      
      // Update message status to error
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempId ? { ...msg, status: 'error' } : msg
        )
      );
    }
  };
  
  // Toggle starred status
  const handleToggleStar = async () => {
    if (!currentChat) return;
    
    try {
      const response = await fetch('/api/chats/star', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId,
          starred: !currentChat.starred
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update star status');
      }
      
      // Update local state
      setCurrentChat(prev => 
        prev ? { ...prev, starred: !prev.starred } : null
      );
    } catch (err) {
      console.error('Error updating star status:', err);
    }
  };
  
  // Handle back button
  const handleBack = () => {
    router.push('/dashboard/messages');
  };

  // Render message status icon
  const renderMessageStatus = (status: string) => {
  const renderMessageStatus = (status: string) => {
    switch (status) {
      case 'sending':
        return <Clock size={14} className="text-gray-500" />;
      case 'sent':
        return <Check size={14} className="text-gray-400" />;
      case 'delivered':
        return <CheckCheck size={14} className="text-gray-400" />;
      case 'read':
        return <CheckCheck size={14} className="text-green-400" />;
      case 'error':
        return <AlertCircle size={14} className="text-red-400" />;
      default:
        return null;
    }
  };
  
  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white items-center justify-center">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-48"></div>
          <div className="h-4 bg-gray-700 rounded w-36"></div>
          <div className="h-10 bg-gray-700 rounded w-64 mt-6"></div>
        </div>
        <p className="text-gray-400 text-sm mt-6">Loading chat...</p>
      </div>
    );
  }
  
  if (error || !currentChat) {
    return (
      <div className="flex flex-col h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white items-center justify-center">
        <AlertCircle size={32} className="text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-white">Error loading chat</h3>
        <p className="text-gray-400 text-sm mt-1">{error || 'Chat not found'}</p>
        <button 
          onClick={handleBack}
          className="mt-6 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white flex items-center"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to messages
        </button>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Chat Header */}
      <header className="px-4 py-3 border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center">
          <button 
            onClick={handleBack}
            className="mr-2 p-1.5 text-gray-400 hover:text-green-400 rounded-lg transition-all duration-200"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="flex items-center">
            <div className="relative">
              <img
                src={currentChat.user.avatar}
                alt={currentChat.user.name}
                className="w-10 h-10 rounded-full"
              />
              <span
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-900 ${
                  currentChat.user.status === "online"
                    ? "bg-green-500"
                    : "bg-gray-500"
                }`}
              ></span>
            </div>

            <div className="ml-3">
              <div className="flex items-center space-x-1">
                <h2 className="font-semibold">{currentChat.user.name}</h2>
                {currentChat.verified && (
                  <Shield size={14} className="text-green-400" />
                )}
              </div>
              <p className="text-xs text-gray-400">
                {currentChat.user.lastSeen}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button className="p-2 text-gray-400 hover:text-green-400 rounded-lg transition-all duration-200">
            <Phone size={18} />
          </button>
          <button className="p-2 text-gray-400 hover:text-green-400 rounded-lg transition-all duration-200">
            <Video size={18} />
          </button>
          <button 
            onClick={handleToggleStar}
            className="p-2 text-gray-400 hover:text-green-400 rounded-lg transition-all duration-200"
          >
            <Star
              size={18}
              className={
                currentChat.starred ? "text-green-400 fill-green-400" : ""
              }
            />
          </button>
          <button className="p-2 text-gray-400 hover:text-green-400 rounded-lg transition-all duration-200">
            <MoreVertical size={18} />
          </button>
        </div>
      </header>

      {/* Encryption Notice */}
      {currentChat.encrypted && (
        <div className="bg-gray-800/50 border-b border-gray-700 px-4 py-2 text-xs text-gray-400 flex items-center justify-center">
          <Shield size={12} className="mr-1 text-green-400" />
          End-to-end encrypted • Messages are secured with{" "}
          {currentChat.user.name}'s public key
        </div>
      )}

      {/* Chat Messages */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4"
        style={{ scrollBehavior: "smooth" }}
      >
        <div className="max-w-3xl mx-auto space-y-4">
          {/* Address Info Card */}
          <div className="bg-gray-800/40 rounded-lg p-3 mb-6 border border-gray-700 flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-gray-700/50 mr-3">
                <Shield size={16} className="text-green-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Connected with</p>
                <p className="text-sm font-medium">
                  {currentChat.user.address}
                </p>
              </div>
            </div>
            <div className="flex space-x-1">
              <button className="p-1.5 text-gray-400 hover:text-green-400 rounded-lg transition-all duration-200">
                <Copy size={14} />
              </button>
              <button className="p-1.5 text-gray-400 hover:text-green-400 rounded-lg transition-all duration-200">
                <ExternalLink size={14} />
              </button>
            </div>
          </div>

          {/* Message Threads */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2.5 ${
                  msg.sender === "me"
                    ? "bg-green-500/20 text-white"
                    : "bg-gray-800/70 text-white"
                } ${msg.isFile ? "overflow-hidden" : ""}`}
              >
                {msg.isFile ? (
                  <div>
                    <div className="flex items-center border border-gray-700/50 rounded-lg p-2 bg-gray-800/70 mb-2">
                      <div className="p-2 mr-2 bg-gray-700 rounded-md">
                        <FileText size={18} className="text-green-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {msg.fileName}
                        </p>
                        <p className="text-xs text-gray-400">{msg.fileSize}</p>
                      </div>
                      <button className="ml-2 p-1.5 text-gray-400 hover:text-green-400 rounded-lg transition-all duration-200">
                        <ExternalLink size={14} />
                      </button>
                    </div>
                    <p className="text-sm">{msg.content}</p>
                  </div>
                ) : (
                  <p className="text-sm">{msg.content}</p>
                )}

                <div
                  className={`flex items-center mt-1 text-xs ${msg.sender === "me" ? "justify-end" : ""}`}
                >
                  <span
                    className={`${msg.sender === "me" ? "text-gray-300" : "text-gray-400"}`}
                  >
                    {msg.timestamp}
                  </span>
                  {msg.sender === "me" && (
                    <span className="ml-1">
                      {renderMessageStatus(msg.status)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="px-4 py-3 border-t border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky bottom-0">
        <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto">
          <div className="flex items-center">
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-green-400 rounded-lg transition-all duration-200"
            >
              <PaperclipIcon size={20} />
            </button>

            <div className="flex-1 mx-2">
              <input
                type="text"
                ref={messageInputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="w-full bg-gray-700 border border-gray-600 rounded-lg text-white px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={!message.trim()}
              className={`p-2.5 rounded-full transition-all duration-200 ${
                message.trim()
                  ? "bg-gradient-to-r from-green-600 to-green-500 text-gray-900 shadow-[0_0_10px_rgba(34,197,94,0.3)] hover:shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                  : "bg-gray-700 text-gray-500"
              }`}
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Page;
