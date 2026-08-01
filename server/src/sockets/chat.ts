import { Socket } from 'socket.io';
import { socketSdk } from 'socketio-kit/server';
import { memoryStore } from '../store/memory.js';

export function setupChatHandlers(socket: Socket) {
  const fromUserId = socket.handshake.query.userId as string;

  // ─── Private Chat ───────────────────────────────────────
  socket.on('private:send', (data: { to: string; message: string; type?: 'text' | 'image' | 'file'; fileUrl?: string }) => {
    if (!data.to || !data.message) return;

    const msg = memoryStore.addMessage({
      from: fromUserId,
      to: data.to,
      content: data.message,
      type: data.type || 'text',
      fileUrl: data.fileUrl,
    });

    // Send to recipient
    socketSdk.toUser(data.to, 'private:receive', {
      messageId: msg.id,
      from: fromUserId,
      message: msg.content,
      type: msg.type,
      fileUrl: msg.fileUrl,
      timestamp: msg.timestamp,
    });

    // Echo back to sender
    socket.emit('private:sent-ack', msg);
  });

  socket.on('private:read', (data: { messageId: string; from: string }) => {
    if (data.messageId) {
      memoryStore.markAsRead(data.messageId);
      socketSdk.toUser(data.from, 'private:read-ack', { messageId: data.messageId });
    }
  });

  // ─── Group Chat ──────────────────────────────────────────
  socket.on('group:create', (data: { name: string; description?: string; members: string[] }) => {
    if (!data.name) return;

    const group = memoryStore.createGroup(data.name, data.description, fromUserId, data.members);

    // Join all member sockets to the group room
    group.members.forEach((memberId) => {
      socketSdk.toUser(memberId, 'group:created', group);
    });
  });

  socket.on('group:join', (data: { groupId: string }) => {
    if (!data.groupId) return;
    socket.join(data.groupId);

    const user = memoryStore.getUserById(fromUserId);
    socketSdk.toRoom(data.groupId, 'group:user-joined', {
      groupId: data.groupId,
      user,
    });
  });

  socket.on('group:send', (data: { groupId: string; message: string; type?: 'text' | 'image' | 'file'; fileUrl?: string }) => {
    if (!data.groupId || !data.message) return;

    const msg = memoryStore.addMessage({
      from: fromUserId,
      groupId: data.groupId,
      content: data.message,
      type: data.type || 'text',
      fileUrl: data.fileUrl,
    });

    // Broadcast to room
    socketSdk.toRoom(data.groupId, 'group:receive', {
      messageId: msg.id,
      groupId: data.groupId,
      from: fromUserId,
      message: msg.content,
      type: msg.type,
      fileUrl: msg.fileUrl,
      timestamp: msg.timestamp,
    });
  });

  // ─── Emoji Reactions ─────────────────────────────────────
  socket.on('message:react', (data: { messageId: string; emoji: string; toUserId?: string; groupId?: string }) => {
    if (!data.messageId || !data.emoji) return;

    const updatedMsg = memoryStore.addReaction(data.messageId, fromUserId, data.emoji);
    if (!updatedMsg) return;

    const payload = {
      messageId: data.messageId,
      reactions: updatedMsg.reactions,
    };

    if (data.toUserId) {
      socketSdk.toUser(data.toUserId, 'message:reaction-update', payload);
      socket.emit('message:reaction-update', payload);
    } else if (data.groupId) {
      socketSdk.toRoom(data.groupId, 'message:reaction-update', payload);
    }
  });
}
