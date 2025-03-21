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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Page Header */}
      <header className="px-4 py-6 border-b border-gray-800">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-500 to-green-300 text-transparent bg-clip-text">
              P2P Chats
            </h1>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-green-400 transition-all duration-200">
                <Settings size={20} />
              </button>
              <button className="bg-gradient-to-r from-green-600 to-green-500 text-gray-900 font-medium rounded-lg p-2 shadow-[0_0_10px_rgba(34,197,94,0.3)] hover:shadow-[0_0_15px_rgba(34,197,94,0.4)] transition-all duration-300">
                <Plus size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 pb-20 md:pb-4">
        {/* Search and Filter */}
        <div className="mt-6 mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search chats or addresses..."
              className="w-full bg-gray-700 border border-gray-600 rounded-lg text-white px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          </div>
          
          {/* Filters */}
          <div className="flex space-x-2 mt-4">
            <button
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeFilter === 'all'
                  ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                  : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700'
              }`}
              onClick={() => setActiveFilter('all')}
            >
              All
            </button>
            <button
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-1 ${
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
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-1 ${
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
        
        {/* Conversations List */}
        <div className="space-y-3">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((convo) => (
              <div
                key={convo.id}
                className="bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-lg p-3 transition-all duration-200 hover:shadow-[0_0_10px_rgba(34,197,94,0.2)] cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
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
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-white truncate">
                        {convo.user.name}
                      </h3>
                      <div className="flex items-center ml-2 space-x-1">
                        {convo.starred && (
                          <Star size={12} className="text-green-400 fill-green-400" />
                        )}
                        <span className="text-xs text-gray-400 flex items-center">
                          <Clock size={12} className="mr-1" /> {convo.timestamp}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-sm text-gray-400 truncate max-w-xs">
                        {convo.lastMessage}
                      </p>
                      {convo.unread > 0 && (
                        <span className="ml-2 flex-shrink-0 bg-green-500 text-gray-900 text-xs font-medium px-2 py-0.5 rounded-full">
                          {convo.unread}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      {convo.user.address}
                    </p>
                  </div>
                </div>
                <div className="text-gray-400 hover:text-green-400 transition-all duration-200">
                  <ArrowRight size={18} />
                </div>
              </div>
            ))
          ) : (
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 text-center">
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
      </main>
    </div>
  );
};

export default ChatsList;