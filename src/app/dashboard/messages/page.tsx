"use client"

import React, { useState } from 'react';
import { Search, Plus, MessageSquare, Clock, Star, Settings, ArrowRight } from 'lucide-react';

const ChatsList = () => {
  // Example data for chat conversations
  const [conversations, setConversations] = useState([
    {
      id: '1',
      user: {
        name: 'Alice Crypto',
        address: '0xF3b2...9a4D',
        avatar: '/api/placeholder/40/40',
        status: 'online'
      },
      lastMessage: 'Hey, have you checked the latest token price?',
      timestamp: '15m ago',
      unread: 3,
      starred: true
    },
    {
      id: '2',
      user: {
        name: 'Bob Blockchain',
        address: '0x7D1c...3e5F',
        avatar: '/api/placeholder/40/40',
        status: 'offline'
      },
      lastMessage: 'AHAHAHAHAH',
      timestamp: '2h ago',
      unread: 0,
      starred: false
    },
    {
      id: '3',
      user: {
        name: 'Carol Coinbase',
        address: '0x4A9d...7B2e',
        avatar: '/api/placeholder/40/40',
        status: 'online'
      },
      lastMessage: 'The smart contract has been deployed successfully',
      timestamp: 'Yesterday',
      unread: 1,
      starred: false
    },
    {
      id: '4',
      user: {
        name: 'Dave DeFi',
        address: '0x2E6b...1F8c',
        avatar: '/api/placeholder/40/40',
        status: 'idle'
      },
      lastMessage: 'Can you help me with the staking process?',
      timestamp: '2 days ago',
      unread: 0,
      starred: true
    },
    {
      id: '5',
      user: {
        name: 'Eve Ethereum',
        address: '0x9C3a...8D2b',
        avatar: '/api/placeholder/40/40',
        status: 'offline'
      },
      lastMessage: 'Looking forward to the new protocol update',
      timestamp: '1 week ago',
      unread: 0,
      starred: false
    }
  ]);
  
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter conversations based on active filter and search query
  const filteredConversations = conversations.filter(convo => {
    // Filter by type
    if (activeFilter === 'starred' && !convo.starred) return false;
    if (activeFilter === 'unread' && convo.unread === 0) return false;
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        convo.user.name.toLowerCase().includes(query) ||
        convo.user.address.toLowerCase().includes(query) ||
        convo.lastMessage.toLowerCase().includes(query)
      );
    }
    
    return true;
  });
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col">
      {/* Fixed Header */}
      <header className="sticky top-0 z-20 px-4 py-4 border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold bg-gradient-to-r from-green-500 to-green-300 text-transparent bg-clip-text">
              P2P Chats
            </h1>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-green-400 transition-all duration-200">
                <Settings size={18} />
              </button>
              <button className="bg-gradient-to-r from-green-600 to-green-500 text-gray-900 font-medium rounded-lg p-2 shadow-[0_0_10px_rgba(34,197,94,0.3)] hover:shadow-[0_0_15px_rgba(34,197,94,0.4)] transition-all duration-300">
                <Plus size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Search and Filter - Fixed below header */}
      <div className="sticky top-[65px] z-10 bg-gray-900/95 backdrop-blur-sm px-4 py-3 border-b border-gray-800">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search chats or addresses..."
              className="w-full bg-gray-700 border border-gray-600 rounded-lg text-white px-4 py-2 pl-9 focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          </div>
          
          {/* Filters */}
          <div className="flex space-x-2 mt-3 overflow-x-auto pb-1 no-scrollbar">
            <button
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex-shrink-0 ${
                activeFilter === 'all'
                  ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                  : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700'
              }`}
              onClick={() => setActiveFilter('all')}
            >
              All
            </button>
            <button
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-1 flex-shrink-0 ${
                activeFilter === 'unread'
                  ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                  : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700'
              }`}
              onClick={() => setActiveFilter('unread')}
            >
              <MessageSquare size={14} />
              <span>Unread</span>
            </button>
            <button
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-1 flex-shrink-0 ${
                activeFilter === 'starred'
                  ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                  : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700'
              }`}
              onClick={() => setActiveFilter('starred')}
            >
              <Star size={14} />
              <span>Starred</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Scrollable Conversations List */}
      <div className="flex-1 overflow-y-auto pb-16">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="space-y-3">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((convo) => (
                <div
                  key={convo.id}
                  className="bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-lg p-3 transition-all duration-200 hover:shadow-[0_0_10px_rgba(34,197,94,0.2)] cursor-pointer"
                >
                  <div className="flex items-start space-x-3">
                    {/* Avatar with Status */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={convo.user.avatar}
                        alt={convo.user.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-800 ${
                          convo.user.status === 'online'
                            ? 'bg-green-500'
                            : convo.user.status === 'idle'
                            ? 'bg-yellow-500'
                            : 'bg-gray-500'
                        }`}
                      ></span>
                    </div>
                    
                    {/* Message Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-white truncate max-w-[120px] sm:max-w-[200px]">
                          {convo.user.name}
                        </h3>
                        <div className="flex items-center ml-1 space-x-1">
                          {convo.starred && (
                            <Star size={12} className="text-green-400 fill-green-400 flex-shrink-0" />
                          )}
                          <span className="text-xs text-gray-400 flex items-center whitespace-nowrap">
                            <Clock size={12} className="mr-1 flex-shrink-0" /> {convo.timestamp}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-sm text-gray-400 truncate pr-2">
                          {convo.lastMessage}
                        </p>
                        {convo.unread > 0 && (
                          <span className="flex-shrink-0 bg-green-500 text-gray-900 text-xs font-medium px-2 py-0.5 rounded-full">
                            {convo.unread}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-gray-500 truncate max-w-[180px]">
                          {convo.user.address}
                        </p>
                        <ArrowRight size={16} className="text-gray-400 flex-shrink-0" />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 text-center my-8">
                <MessageSquare size={32} className="mx-auto text-gray-500 mb-2" />
                <h3 className="text-lg font-medium text-white">No conversations found</h3>
                <p className="text-gray-400 text-sm mt-1">
                  {searchQuery
                    ? `No results for "${searchQuery}"`
                    : activeFilter === 'starred'
                    ? "You don't have any starred conversations"
                    : activeFilter === 'unread'
                    ? "You don't have any unread messages"
                    : "Start a new conversation by clicking the + button"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Add custom scrollbar style for webkit browsers */}
      <style jsx global>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        
        /* Hide scrollbar for IE, Edge and Firefox */
        .no-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>
    </div>
  );
};

export default ChatsList;