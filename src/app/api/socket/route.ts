import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { messages } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Set explicit runtime
export const runtime = 'edge';

// Global connections store
type Connection = {
  userId: string;
  controller: ReadableStreamDefaultController;
};
const connections = new Map<string, Connection>();

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const userId = session.user.id;
  
  // Create stream for this user
  const stream = new ReadableStream({
    start: (controller) => {
      // Store the connection
      connections.set(userId, { userId, controller });
      
      // Send initial connection message
      const connectEvent = {
        event: 'connected',
        data: { userId, timestamp: new Date().toISOString() }
      };
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(connectEvent)}\n\n`));
      
      // Keep-alive interval
      const keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode(`: ping\n\n`));
      }, 30000);
      
      // Clean up on close
      return () => {
        clearInterval(keepAlive);
        connections.delete(userId);
      };
    }
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}

// Text encoder for sending data
const encoder = new TextEncoder();

// Helper function to send message to a specific user
function sendMessage(targetUserId: string, event: string, data: any) {
  const connection = connections.get(targetUserId);
  if (!connection) return false;
  
  try {
    const payload = { event, data };
    connection.controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
    return true;
  } catch (e) {
    console.error('Error sending message:', e);
    return false;
  }
}

// Handle incoming message POST requests
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const payload = await req.json();
    const { receiverId, message, chatId } = payload;
    
    if (!receiverId || !message || !chatId) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Store the message in the database
    const [insertedMessage] = await db.insert(messages).values({
      senderId: session.user.id,
      receiverId,
      content: message,
      conversationID: chatId,
      isRead: false,
    }).returning();
    
    // Send real-time notification to the receiver if they're connected
    sendMessage(receiverId, 'new-message', {
      id: insertedMessage.id,
      senderId: session.user.id,
      message,
      chatId,
      timestamp: new Date().toISOString()
    });
    
    return Response.json({
      success: true,
      messageId: insertedMessage.id
    });
  } catch (error) {
    console.error('Error handling message:', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
} 