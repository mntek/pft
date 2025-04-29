import { useWebSocketContext } from "@/providers/websocket-provider";
import { cn } from "@/lib/utils";
import { Loader2, Wifi, WifiOff } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface RealTimeStatusProps {
  className?: string;
}

export function RealTimeStatus({ className }: RealTimeStatusProps) {
  const { isConnected, isConnecting } = useWebSocketContext();
  
  return (
    <div className={cn("flex items-center", className)}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1">
            {isConnecting ? (
              <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
            ) : isConnected ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <span className="text-xs font-medium">
              {isConnecting
                ? "Connecting..."
                : isConnected
                ? "Real-time"
                : "Offline"}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>
            {isConnecting
              ? "Connecting to real-time updates..."
              : isConnected
              ? "Real-time updates are active"
              : "Real-time updates are not available"}
          </p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}