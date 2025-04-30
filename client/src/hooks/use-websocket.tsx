import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from './use-toast';

export enum MessageType {
  NOTIFICATION = 'notification',
  TRANSACTION = 'transaction',
  BALANCE_UPDATE = 'balance_update',
  EXCHANGE_RATE = 'exchange_rate'
}

export interface WebSocketMessage {
  type: MessageType;
  data: any;
}

type MessageHandler = (data: any) => void;

interface UseWebSocketOptions {
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  onNotification?: MessageHandler;
  onTransaction?: MessageHandler;
  onBalanceUpdate?: MessageHandler;
  onExchangeRateUpdate?: MessageHandler;
  autoReconnect?: boolean;
  reconnectInterval?: number;
  autoConnect?: boolean;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const { toast } = useToast();
  
  const {
    onOpen,
    onClose,
    onError,
    onNotification,
    onTransaction,
    onBalanceUpdate,
    onExchangeRateUpdate,
    autoReconnect = true,
    reconnectInterval = 5000,
    autoConnect = true
  } = options;
  
  // Create a WebSocket connection
  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }
    
    setIsConnecting(true);
    
    // Determine WebSocket protocol based on current page protocol
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;
    
    socket.onopen = () => {
      setIsConnected(true);
      setIsConnecting(false);
      
      if (onOpen) {
        onOpen();
      }
    };
    
    socket.onclose = (event) => {
      setIsConnected(false);
      setIsConnecting(false);
      
      if (onClose) {
        onClose();
      }
      
      // Auto reconnect if enabled and not a normal closure
      if (autoReconnect && event.code !== 1000) {
        setTimeout(connect, reconnectInterval);
      }
    };
    
    socket.onerror = (error) => {
      if (onError) {
        onError(error);
      }
    };
    
    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as WebSocketMessage;
        
        switch (message.type) {
          case MessageType.NOTIFICATION:
            if (onNotification) {
              onNotification(message.data);
            }
            break;
          case MessageType.TRANSACTION:
            if (onTransaction) {
              onTransaction(message.data);
            }
            break;
          case MessageType.BALANCE_UPDATE:
            if (onBalanceUpdate) {
              onBalanceUpdate(message.data);
            }
            break;
          case MessageType.EXCHANGE_RATE:
            if (onExchangeRateUpdate) {
              onExchangeRateUpdate(message.data);
            }
            break;
          default:
            console.warn('Unknown message type:', message.type);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
  }, [
    onOpen, 
    onClose, 
    onError, 
    onNotification, 
    onTransaction, 
    onBalanceUpdate, 
    onExchangeRateUpdate, 
    autoReconnect, 
    reconnectInterval
  ]);
  
  // Send a message to the server
  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
      return true;
    }
    
    toast({
      title: 'Connection Error',
      description: 'Unable to send message. Not connected to server.',
      variant: 'destructive'
    });
    
    return false;
  }, [toast]);
  
  // Send authentication message to associate connection with user
  const authenticate = useCallback((userId: number) => {
    return sendMessage({
      type: MessageType.NOTIFICATION,
      data: {
        type: 'authenticate',
        userId
      }
    });
  }, [sendMessage]);
  
  // Disconnect from the server
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
  }, []);
  
  // Connect on mount if autoConnect is true
  useEffect(() => {
    let mounted = true;
    
    if (autoConnect && mounted) {
      console.log("Auto-connecting to WebSocket");
      try {
        connect();
      } catch (err) {
        console.error("Error connecting to WebSocket:", err);
      }
    }
    
    // Cleanup function
    return () => {
      mounted = false;
      console.log("Cleaning up WebSocket connection");
      if (socketRef.current) {
        try {
          socketRef.current.close();
        } catch (err) {
          console.error("Error closing WebSocket:", err);
        }
      }
    };
  }, [autoConnect, connect]); // Include connect to ensure we use the latest version
  
  return {
    isConnected,
    isConnecting,
    connect,
    disconnect,
    sendMessage,
    authenticate
  };
}