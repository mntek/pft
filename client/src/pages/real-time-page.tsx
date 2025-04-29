import { RealTimeDemo } from "@/components/real-time/real-time-demo";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

export default function RealTimePage() {
  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6">Real-Time Updates</h1>
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
    </div>
  );
}