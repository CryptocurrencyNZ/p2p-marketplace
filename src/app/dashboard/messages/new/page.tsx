"use client"

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Search, 
  Send, 
  UserPlus,
  Shield,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface UserSuggestion {
  id: string;
  name: string;
  address: string;
  avatar: string;
  verified: boolean;
}

const NewMessage = () => {
  const router = useRouter();
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserSuggestion | null>(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
  
  // Handle user search
  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.length < 2) {
      setSuggestions([]);
      return;
    }
    
    try {
      // Search for users
      const response = await fetch(`/api/users/search?query=${encodeURIComponent(value)}`);
      
      if (!response.ok) {
        throw new Error('Failed to search users');
      }
      
      const data = await response.json();
      setSuggestions(data.users || []);
    } catch (err) {
      console.error('Error searching users:', err);
      // Don't show error for search - just empty results
      setSuggestions([]);
    }
  };
  
  // Handle selecting a user from suggestions
  const handleSelectUser = (user: UserSuggestion) => {
    setSelectedUser(user);
    setSearchTerm('');
    setSuggestions([]);
    // Focus the message input after selecting a user
    setTimeout(() => {
      messageInputRef.current?.focus();
    }, 100);
  };
  
  // Handle creating a new conversation
  const handleCreateConversation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser || !message.trim()) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Current user - in production this would come from auth
      const currentUser = "buyer123"; // Default user for demo
      
      // Create a new chat
      const response = await fetch('/api/chats/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user1: currentUser,
          user2: selectedUser.id,
          initialMessage: message
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create conversation');
      }
      
      const data = await response.json();
      
      // Navigate to the newly created conversation
      router.push(`/dashboard/messages/${data.chat.id}`);
    } catch (err) {
      console.error('Error creating conversation:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle back button
  const handleBack = () => {
    router.push('/dashboard/messages');
  };
  
  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Header */}
      <header className="px-4 py-3 border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center">
          <button 
            onClick={handleBack}
            className="mr-2 p-1.5 text-gray-400 hover:text-green-400 rounded-lg transition-all duration-200"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="font-semibold">New Message</h2>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-3xl mx-auto">
          {/* User Search */}
          <div className="mb-6">
            <label className="text-sm text-gray-400 mb-2 block">To:</label>
            {selectedUser ? (
              <div className="flex items-center justify-between bg-gray-800 rounded-lg p-2 mb-2">
                <div className="flex items-center">
                  <img
                    src={selectedUser.avatar}
                    alt={selectedUser.name}
                    className="w-8 h-8 rounded-full mr-2"
                  />
                  <div>
                    <div className="flex items-center">
                      <span className="font-medium">{selectedUser.name}</span>
                      {selectedUser.verified && (
                        <Shield size={14} className="ml-1 text-green-400" />
                      )}
                    </div>
                    <p className="text-xs text-gray-400">{selectedUser.address}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="p-1 text-gray-400 hover:text-red-400"
                >
                  <ArrowLeft size={16} />
                </button>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by username or address..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg text-white px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
                />
                <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                
                {/* Suggestions Dropdown */}
                {suggestions.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg overflow-hidden shadow-lg">
                    {suggestions.map(user => (
                      <div
                        key={user.id}
                        onClick={() => handleSelectUser(user)}
                        className="flex items-center p-3 hover:bg-gray-700 cursor-pointer transition-colors duration-200"
                      >
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-8 h-8 rounded-full mr-2"
                        />
                        <div>
                          <div className="flex items-center">
                            <span className="font-medium">{user.name}</span>
                            {user.verified && (
                              <Shield size={14} className="ml-1 text-green-400" />
                            )}
                          </div>
                          <p className="text-xs text-gray-400">{user.address}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {searchTerm.length > 1 && suggestions.length === 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg overflow-hidden shadow-lg p-4 text-center">
                    <p className="text-gray-400">No users found</p>
                    <button className="mt-2 flex items-center justify-center w-full py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200">
                      <UserPlus size={16} className="mr-2" />
                      <span>Invite new user</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Message Input */}
          <form onSubmit={handleCreateConversation}>
            <div className="mb-6">
              <label className="text-sm text-gray-400 mb-2 block">Message:</label>
              <textarea
                ref={messageInputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your first message..."
                className="w-full bg-gray-700 border border-gray-600 rounded-lg text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm min-h-[120px]"
                disabled={!selectedUser}
              />
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center text-red-400">
                <AlertCircle size={16} className="mr-2" />
                {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={isLoading || !selectedUser || !message.trim()}
              className={`w-full rounded-lg py-3 font-medium flex items-center justify-center ${
                !isLoading && selectedUser && message.trim()
                  ? 'bg-gradient-to-r from-green-600 to-green-500 text-gray-900 shadow-[0_0_10px_rgba(34,197,94,0.3)] hover:shadow-[0_0_15px_rgba(34,197,94,0.4)]'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </span>
              ) : (
                <>
                  <Send size={16} className="mr-2" />
                  Start Conversation
                </>
              )}
            </button>
          </form>
          
          {/* Security Note */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center text-xs text-gray-400">
              <Shield size={12} className="mr-1 text-green-400" />
              Your messages are end-to-end encrypted
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewMessage; 