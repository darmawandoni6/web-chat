import { useEffect } from 'react';
import { socketClient } from 'socketio-kit/client';
import { API_URL } from '../utils/api';

export function useSocket(userId: string | undefined) {
  useEffect(() => {
    if (!userId) return;

    // Connect to Socket.IO server via socketio-kit/client SDK
    socketClient.connect({
      url: API_URL,
      userId,
    });

    return () => {
      // Clean up connection on unmount
      socketClient.disconnect?.();
    };
  }, [userId]);

  return socketClient;
}
