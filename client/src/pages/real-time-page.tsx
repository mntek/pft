import { MainLayout } from "@/components/layout/main-layout";
import { RealTimeDemo } from "@/components/real-time/real-time-demo";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

export default function RealTimePage() {
  return (
    <MainLayout title="Real-Time Updates">
      <div className="space-y-6">
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>About Real-Time Updates</AlertTitle>
          <AlertDescription>
            This page demonstrates the real-time update functionality using WebSockets.
            You can test different types of real-time updates and see them in action.
          </AlertDescription>
        </Alert>
        
        <div className="grid gap-6">
          <RealTimeDemo />
        </div>
      </div>
    </MainLayout>
  );
}