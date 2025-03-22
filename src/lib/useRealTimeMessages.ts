'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';

type MessageEvent = {
  event: string;
  data: any;
};

export function useRealTimeMessages() {
  const { data: session } = useSession();
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<MessageEvent | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  
  // Set up the SSE connection
  useEffect(() => {
    // Only try to connect if logged in
    if (!session?.user?.id) {
      return;
    }
    
    // Close any existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    // Create new connection
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    const eventSource = new EventSource(`${baseUrl}/api/socket`);
    
    // Set up event handlers
    eventSource.onopen = () => {
      console.log('SSE connection opened');
      setIsConnected(true);
    };
    
    eventSource.onmessage = (event) => {
      try {
        // Parse the event data
        const data = JSON.parse(event.data);
        setLastEvent(data);
        console.log('SSE message received:', data);
      } catch (error) {
        console.error('Error parsing SSE message:', error);
      }
    };
    
    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      setIsConnected(false);
      
      // Auto-reconnect after a delay
      setTimeout(() => {
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
        }
        
        // Create new connection if we're still mounted
        if (document.readyState !== 'complete') {
          eventSourceRef.current = new EventSource(`${baseUrl}/api/socket`);
        }
      }, 3000);
    };
    
    // Store ref and clean up on unmount
    eventSourceRef.current = eventSource;
    
    return () => {
      console.log('Cleaning up SSE connection');
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [session]);
  
  // Function to send a message
  const sendMessage = useCallback(async (receiverId: string, content: string, chatId: string) => {
    if (!session?.user?.id) {
      console.error('Cannot send message - not authenticated');
      return false;
    }
    
    try {
      const response = await fetch('/api/socket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiverId,
          message: content,
          chatId,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error sending message:', errorData);
        return false;
      }
      
      const result = await response.json();
      console.log('Message sent result:', result);
      return true;
    } catch (error) {
      console.error('Error calling message API:', error);
      return false;
    }
  }, [session]);
  
  return {
    isConnected,
    lastEvent,
    sendMessage,
  };
} 