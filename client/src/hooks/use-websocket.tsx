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
  requireAuth?: boolean;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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
    autoConnect = true,
    requireAuth = false
  } = options;
  
  // Check authentication status
  const checkAuth = useCallback(async (): Promise<boolean> => {
    try {
      console.log("Checking authentication status before WebSocket connection");
      const res = await fetch(`${window.location.origin}/api/user`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Accept": "application/json"
        }
      });
      
      if (res.status === 401) {
        console.log("User is not authenticated");
        setIsAuthenticated(false);
        return false;
      }
      
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error("Error checking authentication:", error);
      setIsAuthenticated(false);
      return false;
    }
  }, []);

  // Create a WebSocket connection with auth handling
  const connect = useCallback(async () => {
    // Clear any existing reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    // If we're already connected, no need to reconnect
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      return;
    }
    
    // If we require authentication, check first
    if (requireAuth) {
      const isAuthed = await checkAuth();
      if (!isAuthed) {
        console.log("WebSocket connection aborted - not authenticated");
        return;
      }
    }
    
    setIsConnecting(true);
    
    // Close any existing socket before creating a new one
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    
    // Determine WebSocket protocol based on current page protocol
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    console.log(`Connecting to WebSocket at ${wsUrl}`);
    
    try {
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;
      
      socket.onopen = () => {
        console.log("WebSocket connection opened successfully");
        setIsConnected(true);
        setIsConnecting(false);
        
        if (onOpen) {
          onOpen();
        }
      };
      
      socket.onclose = (event) => {
        console.log(`WebSocket connection closed with code ${event.code}`);
        setIsConnected(false);
        setIsConnecting(false);
        
        if (onClose) {
          onClose();
        }
        
        // Only auto-reconnect if:
        // 1. autoReconnect is enabled
        // 2. Not a normal closure (code 1000)
        // 3. If requireAuth is true, then we must be authenticated
        if (autoReconnect && event.code !== 1000 && (!requireAuth || isAuthenticated)) {
          console.log(`Reconnecting in ${reconnectInterval}ms`);
          reconnectTimeoutRef.current = setTimeout(connect, reconnectInterval);
        }
      };
      
      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
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
    } catch (error) {
      console.error("Error creating WebSocket:", error);
      setIsConnecting(false);
      if (onError) {
        onError(error as Event);
      }
    }
  }, [
    onOpen, 
    onClose, 
    onError, 
    onNotification, 
    onTransaction, 
    onBalanceUpdate, 
    onExchangeRateUpdate, 
    autoReconnect, 
    reconnectInterval,
    requireAuth,
    isAuthenticated,
    checkAuth
  ]);
  
  // Send a message to the server
  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
      return true;
    }
    
    console.warn("Cannot send message - WebSocket not connected");
    return false;
  }, []);
  
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
    // Clear any reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (socketRef.current) {
      console.log("Manually disconnecting WebSocket");
      socketRef.current.close();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);
  
  // Connect on mount if autoConnect is true
  useEffect(() => {
    let isMounted = true;
    
    const initializeConnection = async () => {
      // Only connect if we're still mounted
      if (!isMounted) return;
      
      // If we require authentication, check first
      if (requireAuth) {
        const isAuthed = await checkAuth();
        if (!isAuthed) return;
      }
      
      if (autoConnect) {
        connect();
      }
    };
    
    initializeConnection();
    
    // Cleanup function
    return () => {
      isMounted = false;
      
      // Clear any reconnect timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      // Close the WebSocket connection
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [autoConnect, requireAuth, checkAuth, connect]);
  
  return {
    isConnected,
    isConnecting,
    isAuthenticated,
    connect,
    disconnect,
    sendMessage,
    authenticate,
    checkAuth
  };
}