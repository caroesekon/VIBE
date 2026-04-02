import React, { createContext, useContext, useEffect } from 'react';
import { getSocket } from '../services/socketService';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { useQueryClient } from '@tanstack/react-query';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { accessToken, isAuthenticated } = useAuthStore();
  const { setUnreadCount, setPendingRequests } = useUIStore();
  const queryClient = useQueryClient();
  const socket = isAuthenticated && accessToken ? getSocket(accessToken) : null;

  useEffect(() => {
    if (!socket) return;

    // Real-time notification updates
    socket.on('new_notification', (data) => {
      setUnreadCount(prev => prev + 1);
      queryClient.invalidateQueries(['notifications']);
    });

    // Real-time friend request updates
    socket.on('friend_request', (data) => {
      setPendingRequests(prev => prev + 1);
      queryClient.invalidateQueries(['friendRequests']);
      queryClient.invalidateQueries(['suggestions']);
    });

    socket.on('friend_updated', () => {
      queryClient.invalidateQueries(['friends']);
      queryClient.invalidateQueries(['friendRequests']);
      queryClient.invalidateQueries(['suggestions']);
    });

    // Real-time message updates
    socket.on('new_message', (message) => {
      queryClient.invalidateQueries(['conversations']);
      queryClient.invalidateQueries(['messages', message.senderId]);
    });

    // Real-time post updates
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

    socket.on('new_post', (post) => {
      queryClient.invalidateQueries(['feed']);
    });

    // Real-time story updates
    socket.on('story_updated', () => {
      queryClient.invalidateQueries(['stories']);
    });

    return () => {
      socket.off('new_notification');
      socket.off('friend_request');
      socket.off('friend_updated');
      socket.off('new_message');
      socket.off('post_updated');
      socket.off('new_post');
      socket.off('story_updated');
    };
  }, [socket, queryClient, setUnreadCount, setPendingRequests]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};