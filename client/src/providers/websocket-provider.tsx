import React, { createContext, useContext, useEffect } from 'react';
import { useWebSocket, MessageType, WebSocketMessage } from '@/hooks/use-websocket';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { queryClient } from '@/lib/queryClient';

interface WebSocketContextType {
  isConnected: boolean;
  isConnecting: boolean;
  sendMessage: (message: WebSocketMessage) => boolean;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
};

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Handle various WebSocket events
  const handleNotification = (data: any) => {
    // If this is a new notification
    if (data.action === 'new') {
      // Invalidate notifications cache to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
      
      // Show toast notification
      toast({
        title: data.notification.title || 'New Notification',
        description: data.notification.message,
        variant: 'default'
      });
    }
  };
  
  const handleTransaction = (data: any) => {
    // Invalidate relevant queries
    if (data.action === 'new') {
      if (data.transaction.type === 'expense') {
        queryClient.invalidateQueries({ queryKey: ['/api/expenses'] });
      } else if (data.transaction.type === 'income') {
        queryClient.invalidateQueries({ queryKey: ['/api/incomes'] });
      }
      
      // Refresh dashboard data
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
    }
  };
  
  const handleBalanceUpdate = (data: any) => {
    // Invalidate relevant queries
    queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
    
    if (data.source === 'creditCard') {
      queryClient.invalidateQueries({ queryKey: ['/api/credit-cards'] });
    } else if (data.source === 'asset') {
      queryClient.invalidateQueries({ queryKey: ['/api/assets'] });
    }
  };
  
  const handleExchangeRateUpdate = (data: any) => {
    // Invalidate exchange rates query
    queryClient.invalidateQueries({ queryKey: ['/api/exchange-rates'] });
    
    // Show toast notification
    toast({
      title: 'Exchange Rates Updated',
      description: `${data.count} currency rates were updated.`,
      variant: 'default'
    });
  };
  
  const { 
    isConnected, 
    isConnecting, 
    sendMessage,
    authenticate
  } = useWebSocket({
    onNotification: handleNotification,
    onTransaction: handleTransaction,
    onBalanceUpdate: handleBalanceUpdate,
    onExchangeRateUpdate: handleExchangeRateUpdate,
    autoConnect: true,
    autoReconnect: true
  });
  
  // Authenticate with user ID when connection is established and user is logged in
  useEffect(() => {
    if (isConnected && user) {
      authenticate(user.id);
    }
  }, [isConnected, user, authenticate]);
  
  return (
    <WebSocketContext.Provider value={{ isConnected, isConnecting, sendMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
}