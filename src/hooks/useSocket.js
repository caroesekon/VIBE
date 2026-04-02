import { useEffect, useState } from 'react';
import { getSocket, disconnectSocket } from '../services/socketService';
import { useAuthStore } from '../store/authStore';

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const { accessToken, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      const s = getSocket(accessToken);
      setSocket(s);
      return () => {
        // Keep connection for other components; do not disconnect here
      };
    } else {
      if (socket) {
        disconnectSocket();
        setSocket(null);
      }
    }
  }, [isAuthenticated, accessToken]);

  return socket;
};