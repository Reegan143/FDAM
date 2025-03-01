import { useState } from 'react';

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, variant = 'success') => {
    const newNotification = {
      id: Date.now(),
      message,
      variant
    };
    
    setNotifications(prev => [...prev, newNotification]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 5000);
  };

  return { notifications, addNotification };
}