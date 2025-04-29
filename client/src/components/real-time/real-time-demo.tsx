import React, { useState, useEffect } from 'react';
import { useWebSocketContext } from '@/providers/websocket-provider';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { MessageType } from '@/hooks/use-websocket';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, RefreshCcw } from 'lucide-react';

export function RealTimeDemo() {
  const { isConnected, sendMessage } = useWebSocketContext();
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Simulate sending a test message
  const sendTestNotification = () => {
    if (!user) return;
    
    fetch('/api/notifications/generate-due-notifications', {
      method: 'POST',
    })
      .then(res => res.json())
      .then(data => {
        setMessages(prev => [
          {
            type: 'sent',
            timestamp: new Date(),
            content: `Requested ${data.count} notification(s)`,
            success: true
          },
          ...prev
        ]);
      })
      .catch(error => {
        setMessages(prev => [
          {
            type: 'error',
            timestamp: new Date(),
            content: `Error: ${error.message}`,
            success: false
          },
          ...prev
        ]);
      });
  };

  // Simulate a balance update
  const sendTestBalanceUpdate = () => {
    if (!user) return;
    
    const success = sendMessage({
      type: MessageType.BALANCE_UPDATE,
      data: {
        accountId: 123,
        newBalance: Math.floor(Math.random() * 10000) / 100,
        currency: 'USD',
        timestamp: new Date().toISOString()
      }
    });
    
    setMessages(prev => [
      {
        type: 'sent',
        timestamp: new Date(),
        content: 'Sent balance update message',
        success
      },
      ...prev
    ]);
  };

  // Request an exchange rate update
  const requestExchangeRateUpdate = () => {
    fetch('/api/exchange-rates', {
      method: 'GET',
    })
      .then(res => res.json())
      .then(() => {
        setMessages(prev => [
          {
            type: 'sent',
            timestamp: new Date(),
            content: 'Requested exchange rate update',
            success: true
          },
          ...prev
        ]);
        setLastUpdated(new Date());
      })
      .catch(error => {
        setMessages(prev => [
          {
            type: 'error',
            timestamp: new Date(),
            content: `Error: ${error.message}`,
            success: false
          },
          ...prev
        ]);
      });
  };

  // Clear message history
  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Real-Time Updates Demo</CardTitle>
        <CardDescription>
          Test the real-time updates functionality
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant={isConnected ? "success" : "destructive"}>
              {isConnected ? (
                <>
                  <Wifi className="h-3 w-3 mr-1" />
                  Connected
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3 mr-1" />
                  Disconnected
                </>
              )}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              size="sm"
              onClick={sendTestNotification}
              disabled={!isConnected || !user}
            >
              Send Test Notification
            </Button>
            <Button
              size="sm"
              onClick={sendTestBalanceUpdate}
              disabled={!isConnected || !user}
              variant="outline"
            >
              Simulate Balance Update
            </Button>
            <Button
              size="sm"
              onClick={requestExchangeRateUpdate}
              disabled={!user}
              variant="outline"
            >
              <RefreshCcw className="h-3 w-3 mr-1" />
              Update Exchange Rates
            </Button>
          </div>

          <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
            <h4 className="text-sm font-medium mb-2">Message Log</h4>
            {messages.length === 0 ? (
              <p className="text-sm text-muted-foreground">No messages yet. Use the buttons above to test real-time functionality.</p>
            ) : (
              <div className="space-y-2">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded text-sm ${
                      message.type === 'error'
                        ? 'bg-destructive/10'
                        : message.type === 'received'
                        ? 'bg-primary/10'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-medium">{message.type}</span>
                      <span className="text-xs text-muted-foreground">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p>{message.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="ghost" size="sm" onClick={clearMessages}>
          Clear Messages
        </Button>
      </CardFooter>
    </Card>
  );
}