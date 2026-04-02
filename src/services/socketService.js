import { io } from 'socket.io-client';
import { SOCKET_URL } from '../utils/constants';
import { useQueryClient } from '@tanstack/react-query';

let socket = null;

export const getSocket = (token) => {
  if (!socket && token) {
    socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    
    socket.on('connect', () => {
      console.log('Socket connected');
    });
    
    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
    
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Setup real-time listeners
export const setupRealtimeListeners = (queryClient) => {
  if (!socket) return;
  
  // Listen for new posts
  socket.on('new_post', (post) => {
    queryClient.setQueryData(['feed'], (old) => {
      if (!old) return old;
      return {
        ...old,
        pages: old.pages.map((page, idx) => {
          if (idx === 0) {
            return {
              ...page,
              data: [post, ...page.data]
            };
          }
          return page;
        })
      };
    });
  });
  
  // Listen for post updates (likes, comments)
  socket.on('post_updated', (updatedPost) => {
    queryClient.setQueryData(['feed'], (old) => {
      if (!old) return old;
      return {
        ...old,
        pages: old.pages.map(page => ({
          ...page,
          data: page.data.map(post => 
            post._id === updatedPost._id ? updatedPost : post
          )
        }))
      };
    });
  });
  
  // Listen for new notifications
  socket.on('new_notification', () => {
    queryClient.invalidateQueries(['notifications']);
    queryClient.invalidateQueries(['unreadCount']);
  });
  
  // Listen for friend updates
  socket.on('friend_updated', () => {
    queryClient.invalidateQueries(['friends']);
    queryClient.invalidateQueries(['friendRequests']);
    queryClient.invalidateQueries(['suggestions']);
  });
  
  // Listen for new messages
  socket.on('new_message', (message) => {
    queryClient.invalidateQueries(['conversations']);
    queryClient.setQueryData(['messages', message.senderId], (old) => {
      if (!old) return old;
      return {
        ...old,
        data: [...old.data, message]
      };
    });
  });
};