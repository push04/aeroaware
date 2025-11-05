import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Unable to Load Data",
  message = "We're having trouble loading air quality data. Please check your connection and try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <Card className="p-8 text-center">
      <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
        <div className="h-16 w-16 rounded-full bg-warning/10 flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-warning" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {message}
          </p>
        </div>
        {onRetry && (
          <Button onClick={onRetry} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </div>
    </Card>
  );
}
