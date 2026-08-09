import { Socket } from 'socket.io';
import { socketSdk } from 'socketio-kit/server';
import { memoryStore } from '../store/memory.js';

export function setupPresenceHandlers(socket: Socket) {
  const userId = socket.handshake.query.userId as string;

  if (userId) {
    // Cancel 5-second disconnect timer if reconnected
    const reconnected = memoryStore.cancelDisconnectGracePeriod(userId);
    if (reconnected) {
      console.log(`⚡ User ${userId} reconnected within 5s grace period!`);
    }

    memoryStore.setOnline(socket.id, userId);
    const user = memoryStore.getUserById(userId);

    // Auto-join socket to all group rooms user belongs to (including public-lounge)
    const userGroups = memoryStore.getUserGroups(userId);
    userGroups.forEach((g) => {
      socket.join(g.id);
    });

    // Broadcast user online to everyone
    socketSdk.broadcast('presence:online', {
      userId,
      username: user?.username || 'Unknown',
      email: user?.email || '',
      reconnected,
    });



    // Send current online user IDs to the connected client
    socket.emit('presence:list', memoryStore.getOnlineUserIds());
  }

  socket.on('disconnect', () => {
    const disconnectedUserId = memoryStore.setOffline(socket.id);
    if (disconnectedUserId) {
      const user = memoryStore.getUserById(disconnectedUserId);
      const stillHasSockets = memoryStore.isUserOnline(disconnectedUserId);

      if (!stillHasSockets) {
        if (user?.isGuest) {
          // Guest User -> Immediately remove from server memory and notify clients
          console.log(`👋 Guest user ${disconnectedUserId} disconnected. Removing immediately from memory.`);
          const result = memoryStore.deleteUser(disconnectedUserId);
          socketSdk.broadcast('presence:offline', {
            userId: disconnectedUserId,
            username: result.username || user.username,
          });
          socketSdk.broadcast('user:removed', { userId: disconnectedUserId });
        } else {
          // Google OAuth User -> Configurable grace period timer (from .env) before removing from memory
          const graceMs = parseInt(process.env.GOOGLE_DISCONNECT_GRACE_MS || '5000', 10);
          console.log(
            `⏳ Google user ${disconnectedUserId} disconnected. Starting ${graceMs}ms grace period timer.`
          );

          memoryStore.scheduleDisconnectGracePeriod(disconnectedUserId, graceMs, () => {
            console.log(
              `⏰ ${graceMs}ms disconnect grace period expired for Google user ${disconnectedUserId}. Removing from memory.`
            );
            const result = memoryStore.deleteUser(disconnectedUserId);
            socketSdk.broadcast('presence:offline', {
              userId: disconnectedUserId,
              username: result.username || user?.username || 'Unknown',
            });
            socketSdk.broadcast('user:removed', { userId: disconnectedUserId });
          });
        }
      }
    }
  });
}


