import { Socket } from 'socket.io';
import { socketSdk } from 'socketio-kit/server';
import { memoryStore } from '../store/memory.js';

export function setupPresenceHandlers(socket: Socket) {
  const userId = socket.handshake.query.userId as string;

  if (userId) {
    memoryStore.setOnline(socket.id, userId);
    const user = memoryStore.getUserById(userId);

    // Broadcast user online to everyone
    socketSdk.broadcast('presence:online', {
      userId,
      username: user?.username || 'Unknown',
    });

    // Send current online user IDs to the connected client
    socket.emit('presence:list', memoryStore.getOnlineUserIds());
  }

  socket.on('disconnect', () => {
    const disconnectedUserId = memoryStore.setOffline(socket.id);
    if (disconnectedUserId) {
      const user = memoryStore.getUserById(disconnectedUserId);
      socketSdk.broadcast('presence:offline', {
        userId: disconnectedUserId,
        username: user?.username || 'Unknown',
      });
    }
  });
}
