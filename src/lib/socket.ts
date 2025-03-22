'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';

// Custom hook for SSE connections
export function useRealTimeMessages() {
  const { data: session } = useSession();
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<any>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Setup SSE connection
  useEffect(() => {
    // Only initialize when authenticated
    if (!session?.user?.id) return;

    // Create EventSource connection if not exists
    if (!eventSourceRef.current) {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      const url = new URL('/api/socket', baseUrl);
      
      const eventSource = new EventSource(url.toString());
      
      // Connection opened
      eventSource.onopen = () => {
        setIsConnected(true);
        console.log('SSE connection established');
      };
      
      // Handle messages
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastEvent(data);
        } catch (error) {
          console.error('Error parsing SSE message:', error);
        }
      };
      
      // Handle errors
      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        setIsConnected(false);
        
        // Clean up and retry connection
        eventSource.close();
        eventSourceRef.current = null;
        
        // Retry connection after a delay
        setTimeout(() => {
          if (!eventSourceRef.current) {
            eventSourceRef.current = new EventSource(url.toString());
          }
        }, 5000);
      };
      
      eventSourceRef.current = eventSource;
    }
    
    // Clean up on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [session]);
  
  // Function to send a message
  const sendMessage = useCallback(async (receiverId: string, message: string, chatId: string) => {
    if (!session?.user?.id || !isConnected) return false;
    
    try {
      const response = await fetch('/api/socket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ receiverId, message, chatId }),
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }, [session, isConnected]);
  
  return {
    isConnected,
    lastEvent,
    sendMessage
  };
} 