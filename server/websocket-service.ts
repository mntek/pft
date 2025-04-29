import { Server } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { log } from './vite';

// Connection types
export enum MessageType {
  NOTIFICATION = 'notification',
  TRANSACTION = 'transaction',
  BALANCE_UPDATE = 'balance_update',
  EXCHANGE_RATE = 'exchange_rate'
}

// Message interface
export interface WebSocketMessage {
  type: MessageType;
  data: any;
}

// WebSocket clients with their associated user ID
const clients = new Map<WebSocket, number | null>();

// Initialize WebSocket server
export function initializeWebSocketServer(server: Server): WebSocketServer {
  const wss = new WebSocketServer({ server, path: '/ws' });
  
  log('WebSocket server initialized', 'websocket');
  
  wss.on('connection', (ws: WebSocket) => {
    // Initially set client with no user ID
    clients.set(ws, null);
    log('New WebSocket connection established', 'websocket');
    
    // Handle incoming messages
    ws.on('message', (message: string) => {
      try {
        const parsedMessage = JSON.parse(message);
        
        // Handle authentication message to associate WebSocket with user ID
        if (parsedMessage.type === 'authenticate' && parsedMessage.userId) {
          clients.set(ws, parsedMessage.userId);
          log(`WebSocket authenticated for user ${parsedMessage.userId}`, 'websocket');
          
          // Send confirmation to client
          sendToClient(ws, {
            type: MessageType.NOTIFICATION,
            data: {
              message: 'Successfully connected to real-time updates'
            }
          });
        }
      } catch (error) {
        log(`Error processing WebSocket message: ${error}`, 'websocket');
      }
    });
    
    // Handle client disconnection
    ws.on('close', () => {
      clients.delete(ws);
      log('WebSocket connection closed', 'websocket');
    });
    
    // Send welcome message
    ws.send(JSON.stringify({
      type: MessageType.NOTIFICATION,
      data: {
        message: 'Connected to Financial Tracker real-time updates'
      }
    }));
  });
  
  return wss;
}

// Send message to a specific client
export function sendToClient(client: WebSocket, message: WebSocketMessage): boolean {
  if (client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify(message));
    return true;
  }
  return false;
}

// Send message to all connected clients
export function broadcastToAll(message: WebSocketMessage): void {
  clients.forEach((_, client) => {
    sendToClient(client, message);
  });
  log(`Broadcasted message to ${clients.size} clients`, 'websocket');
}

// Send message to a specific user (all their connections)
export function sendToUser(userId: number, message: WebSocketMessage): number {
  let sentCount = 0;
  
  clients.forEach((clientUserId, client) => {
    if (clientUserId === userId) {
      if (sendToClient(client, message)) {
        sentCount++;
      }
    }
  });
  
  if (sentCount > 0) {
    log(`Sent message to user ${userId} on ${sentCount} connections`, 'websocket');
  }
  
  return sentCount;
}

// Notify about new notifications
export function notifyNewNotification(userId: number, notification: any): void {
  sendToUser(userId, {
    type: MessageType.NOTIFICATION,
    data: {
      action: 'new',
      notification
    }
  });
}

// Notify about account balance changes
export function notifyBalanceUpdate(userId: number, balanceData: any): void {
  sendToUser(userId, {
    type: MessageType.BALANCE_UPDATE,
    data: balanceData
  });
}

// Notify about new transactions
export function notifyNewTransaction(userId: number, transaction: any): void {
  sendToUser(userId, {
    type: MessageType.TRANSACTION,
    data: {
      action: 'new',
      transaction
    }
  });
}

// Notify about exchange rate updates
export function notifyExchangeRateUpdate(rateData: any): void {
  broadcastToAll({
    type: MessageType.EXCHANGE_RATE,
    data: rateData
  });
}