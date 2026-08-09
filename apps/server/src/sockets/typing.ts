import { Socket } from 'socket.io';
import { socketSdk } from 'socketio-kit/server';

export function setupTypingHandlers(socket: Socket) {
  const fromUserId = socket.handshake.query.userId as string;

  // Typing start
  socket.on('typing:start', (data: { to?: string; groupId?: string }) => {
    if (data.to) {
      socketSdk.toUser(data.to, 'typing:update', {
        from: fromUserId,
        isTyping: true,
        chatId: fromUserId,
      });
    } else if (data.groupId) {
      socketSdk.toRoom(data.groupId, 'typing:update', {
        from: fromUserId,
        isTyping: true,
        chatId: data.groupId,
      });
    }
  });

  // Typing stop
  socket.on('typing:stop', (data: { to?: string; groupId?: string }) => {
    if (data.to) {
      socketSdk.toUser(data.to, 'typing:update', {
        from: fromUserId,
        isTyping: false,
        chatId: fromUserId,
      });
    } else if (data.groupId) {
      socketSdk.toRoom(data.groupId, 'typing:update', {
        from: fromUserId,
        isTyping: false,
        chatId: data.groupId,
      });
    }
  });
}
