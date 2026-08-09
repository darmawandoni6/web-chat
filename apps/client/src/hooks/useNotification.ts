import { useEffect } from 'react';

export function useNotification() {
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if ('Notification' in window && Notification.permission === 'granted' && document.hidden) {
      new Notification(title, options);
    }
  };

  return { sendNotification };
}
