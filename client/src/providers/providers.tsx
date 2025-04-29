import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/hooks/use-auth';
import { ExchangeRatesProvider } from '@/providers/exchange-rates-provider';
import { WebSocketProvider } from '@/providers/websocket-provider';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <AuthProvider>
          <ExchangeRatesProvider>
            <WebSocketProvider>
              {children}
              <Toaster />
            </WebSocketProvider>
          </ExchangeRatesProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}