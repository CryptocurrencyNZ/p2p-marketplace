"use client";

import React, { useState, useRef } from "react";
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
  FileText,
} from "lucide-react";

const Page = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug: chatId } = await params;
  return <ChatApp {...{ chatId }} />;
};

const ChatApp = ({ chatId = "1" }: { chatId: string }) => {
  // References
  const messageInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Mock data for the current chat
  const [currentChat] = useState({
    id: chatId,
    user: {
      name: "Alice Crypto",
      address: "0xF3b217A5F7A9a4D", // Full address for the actual chat page
      avatar: "/api/placeholder/48/48",
      status: "online",
      lastSeen: "Active now",
    },
    starred: true,
    encrypted: true,
    verified: true,
  });

  // Message states
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "m1",
      sender: "them",
      content:
        "Hey there, have you checked the latest token price? I think we might want to consider rebalancing our liquidity positions.",
      timestamp: "10:32 AM",
      status: "read",
    },
    {
      id: "m2",
      sender: "me",
      content: "HELLLOOOO",
      timestamp: "10:35 AM",
      status: "read",
    },
    {
      id: "m3",
      sender: "them",
      content:
        "What do you think about moving some assets to that new yield farming protocol?",
      timestamp: "10:37 AM",
      status: "read",
    },
    {
      id: "m4",
      sender: "me",
      content: "HELLLOOO",
      timestamp: "10:40 AM",
      status: "read",
    },
    {
      id: "m5",
      sender: "them",
      content: "HELLLOOO",
      timestamp: "10:42 AM",
      status: "read",
    },
    {
      id: "m6",
      sender: "them",
      isFile: true,
      fileType: "pdf",
      fileName: "SecurityAudit_Report.pdf",
      fileSize: "2.4 MB",
      content: "HELLLOOO",
      timestamp: "10:43 AM",
      status: "read",
    },
    {
      id: "m7",
      sender: "me",
      content: "HELLLOOO",
      timestamp: "10:48 AM",
      status: "sent",
    },
    {
      id: "m8",
      sender: "me",
      content:
        "By the way, have you set up your hardware wallet for the new chain yet?",
      timestamp: "10:50 AM",
      status: "delivered",
    },
  ]);

  // Auto scroll to bottom when new messages arrive

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() === "") return;

    // Add new message to the list
    const newMessage = {
      id: `m${messages.length + 1}`,
      sender: "me",
      content: message,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "sending",
    };

    setMessages([...messages, newMessage]);
    setMessage("");

    // Simulate message sending status updates
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: "sent" } : msg,
        ),
      );

      setTimeout(() => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === newMessage.id ? { ...msg, status: "delivered" } : msg,
          ),
        );

        // Simulate a response after 2-3 seconds
        if (Math.random() > 0.3) {
          setTimeout(
            () => {
              const responses = [
                "That's interesting, tell me more.",
                "I need to think about this approach.",
                "Yes, I've been working on that setup.",
                "Have you considered the gas fees on that network?",
                "The tokenomics look solid, but I'm concerned about the team's background.",
              ];

              const responseMsg = {
                id: `m${messages.length + 2}`,
                sender: "them",
                content:
                  responses[Math.floor(Math.random() * responses.length)],
                timestamp: new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                status: "read",
              };

              setMessages((prev) => [...prev, responseMsg]);

              setTimeout(() => {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === newMessage.id ? { ...msg, status: "read" } : msg,
                  ),
                );
              }, 1000);
            },
            2000 + Math.random() * 1000,
          );
        }
      }, 1000);
    }, 800);
  };

  // Render message status icon
  const renderMessageStatus = (status: string) => {
    switch (status) {
      case "sending":
        return <Clock size={14} className="text-gray-500" />;
      case "sent":
        return <Check size={14} className="text-gray-400" />;
      case "delivered":
        return <CheckCheck size={14} className="text-gray-400" />;
      case "read":
        return <CheckCheck size={14} className="text-green-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Chat Header */}
      <header className="px-4 py-3 border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center">
          <button className="mr-2 p-1.5 text-gray-400 hover:text-green-400 rounded-lg transition-all duration-200 md:hidden">
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
          <button className="p-2 text-gray-400 hover:text-green-400 rounded-lg transition-all duration-200">
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
