import { NextResponse } from 'next/server';

// Simple in-memory store
// Structure: { roomId: Message[] }
// We use a global variable attached to globalThis to survive hot reloads in dev
const globalStore = (globalThis as any).chatStore || {};
(globalThis as any).chatStore = globalStore;

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');
    const afterTimestamp = searchParams.get('after');

    if (!roomId) {
        return NextResponse.json({ error: 'Room ID required' }, { status: 400 });
    }

    let messages = globalStore[roomId] || [];

    if (afterTimestamp) {
        messages = messages.filter((m: any) => new Date(m.timestamp) > new Date(afterTimestamp));
    }

    return NextResponse.json({ messages });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { roomId, message, sender, type, fileData, fileName } = body;

        if (!roomId) {
            return NextResponse.json({ error: 'Room ID required' }, { status: 400 });
        }

        if (!globalStore[roomId]) {
            globalStore[roomId] = [];
        }

        const newMessage = {
            id: Date.now().toString() + Math.random().toString(36).substring(7),
            text: message || '',
            sender: sender || 'Anonymous',
            timestamp: new Date().toISOString(),
            type: type || 'text', // 'text' | 'image' | 'file'
            fileData: fileData || null, // Base64 string
            fileName: fileName || null,
        };

        globalStore[roomId].push(newMessage);

        // Keep only last 100 messages to save memory
        if (globalStore[roomId].length > 100) {
            globalStore[roomId] = globalStore[roomId].slice(-100);
        }

        return NextResponse.json({ success: true, message: newMessage });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
