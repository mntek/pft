import { useEffect } from "react";
import { Link } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Check, CreditCard, Info, Trash2, WarningCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface NotificationProps {
  notification: {
    id: number;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
    relatedTo: string | null;
    relatedId: number | null;
  };
  onMarkAsRead: (id: number) => void;
  onDelete: (id: number) => void;
}

function NotificationCard({ notification, onMarkAsRead, onDelete }: NotificationProps) {
  const getIcon = () => {
    switch (notification.type) {
      case "warning":
        return <WarningCircle className="h-5 w-5 text-amber-500" />;
      case "error":
        return <WarningCircle className="h-5 w-5 text-destructive" />;
      case "success":
        return <Check className="h-5 w-5 text-emerald-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };
  
  const getRelatedLink = () => {
    if (!notification.relatedTo || !notification.relatedId) return null;
    
    switch (notification.relatedTo) {
      case "credit_card":
        return `/credit-cards/${notification.relatedId}`;
      case "asset":
        return `/assets/${notification.relatedId}`;
      case "income":
        return `/income/${notification.relatedId}`;
      case "expense":
        return `/expenses/${notification.relatedId}`;
      default:
        return null;
    }
  };
  
  const relatedLink = getRelatedLink();

  return (
    <div className={`flex p-4 border-b ${notification.isRead ? 'bg-background' : 'bg-muted/30'}`}>
      <div className="mr-3 mt-1">{getIcon()}</div>
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <h4 className="font-semibold text-sm">{notification.title}</h4>
          <span className="text-xs text-muted-foreground">
            {formatDate(notification.createdAt)}
          </span>
        </div>
        <p className="text-sm mt-1">{notification.message}</p>
        {relatedLink && (
          <div className="mt-2">
            <Link to={relatedLink}>
              <Button variant="link" size="sm" className="h-auto p-0 text-primary">
                {notification.relatedTo === "credit_card" && <CreditCard className="h-3 w-3 mr-1" />}
                View Details
              </Button>
            </Link>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 ml-2">
        {!notification.isRead && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onMarkAsRead(notification.id)}
            className="h-7 w-7"
          >
            <Check className="h-4 w-4" />
            <span className="sr-only">Mark as read</span>
          </Button>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => onDelete(notification.id)}
          className="h-7 w-7 text-destructive hover:text-destructive/80"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete</span>
        </Button>
      </div>
    </div>
  );
}

export function NotificationList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch notifications
  const { 
    data: notifications, 
    isLoading, 
    isError 
  } = useQuery({
    queryKey: ["/api/notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications");
      if (!res.ok) throw new Error("Failed to fetch notifications");
      return res.json();
    }
  });
  
  // Generate new notifications
  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/notifications/generate-due-notifications");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
      toast({
        title: "Notifications Updated",
        description: "Your notifications have been updated with the latest information.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to Generate Notifications",
        description: "There was an error generating notifications.",
        variant: "destructive",
      });
    }
  });
  
  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/notifications/${id}/read`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
    }
  });
  
  // Mark all as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/notifications/read-all");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
      toast({
        title: "All Notifications Marked as Read",
        description: "All your notifications have been marked as read.",
      });
    }
  });
  
  // Delete notification
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/notifications/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
    }
  });
  
  // Auto-generate notifications on mount
  useEffect(() => {
    generateMutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Handle mark as read
  const handleMarkAsRead = (id: number) => {
    markAsReadMutation.mutate(id);
  };
  
  // Handle mark all as read
  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };
  
  // Handle delete
  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <WarningCircle className="h-10 w-10 text-destructive mb-4" />
        <h3 className="font-semibold text-lg">Failed to Load Notifications</h3>
        <p className="text-muted-foreground mt-1">
          There was an error loading your notifications.
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/notifications"] })}
        >
          Retry
        </Button>
      </div>
    );
  }
  
  if (!notifications || notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center h-64">
        <Bell className="h-10 w-10 text-muted-foreground mb-4" />
        <h3 className="font-semibold text-lg">No Notifications</h3>
        <p className="text-muted-foreground mt-1">
          You don't have any notifications yet.
        </p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
        >
          {generateMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking...
            </>
          ) : (
            <>Check for Notifications</>
          )}
        </Button>
      </div>
    );
  }
  
  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-2 px-4">
        <h3 className="font-semibold">
          {notifications.length} {notifications.length === 1 ? 'Notification' : 'Notifications'}
        </h3>
        {notifications.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleMarkAllAsRead}
            disabled={markAllAsReadMutation.isPending}
            className="h-8 text-xs"
          >
            Mark all as read
          </Button>
        )}
      </div>
      
      <div className="border rounded-md overflow-hidden">
        {notifications.map((notification) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            onMarkAsRead={handleMarkAsRead}
            onDelete={handleDelete}
          />
        ))}
      </div>
      
      <div className="flex justify-center mt-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          className="w-full"
        >
          {generateMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking...
            </>
          ) : (
            <>Check for New Notifications</>
          )}
        </Button>
      </div>
    </div>
  );
}