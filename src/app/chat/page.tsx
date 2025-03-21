"use client";

import { useState, useEffect } from "react";

interface Message {
  id: number;
  sender: string;
  content: string;
  timestamp: string;
}

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [chatId, setChatId] = useState("1");
  const [messages, setMessages] = useState<Message[]>([]);

  // Fetch messages when the component loads
  useEffect(() => {
    fetchMessages();
  }, [chatId]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/chats/${chatId}`);
      const data = await response.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    try {
      const response = await fetch("/api/chats/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId,
          sender: "buyer123",
          content: message,
        }),
      });
      const data = await response.json();
      console.log("Message sent:", data);
      
      // Clear the input and refresh messages
      setMessage("");
      fetchMessages();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Chat</h1>
      
      {/* Messages display */}
      <div className="bg-gray-100 rounded-lg p-4 mb-4 h-[400px] overflow-y-auto">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-2 ${
              msg.sender === "buyer123"
                ? "text-right"
                : "text-left"
            }`}
          >
            <div
              className={`inline-block p-2 rounded-lg ${
                msg.sender === "buyer123"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300"
              }`}
            >
              <p>{msg.content}</p>
              <p className="text-xs opacity-75">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Message input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message"
          className="flex-1 p-2 border rounded-lg"
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
} 