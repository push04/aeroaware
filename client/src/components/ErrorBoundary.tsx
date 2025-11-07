import React, { Component, ErrorInfo, ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleGoHome = () => {
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="p-8 max-w-lg w-full text-center">
            <div className="flex flex-col items-center gap-6">
              <div className="h-20 w-20 rounded-full bg-warning/10 flex items-center justify-center">
                <AlertCircle className="h-10 w-10 text-warning" />
              </div>
              
              <div className="space-y-3">
                <h2 className="text-2xl font-bold">Something Went Wrong</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We encountered an unexpected error. Don't worry, your data is safe.
                  Please try refreshing the page or return to the homepage.
                </p>
                
                {this.state.error && (
                  <details className="mt-4 text-left">
                    <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                      Technical Details
                    </summary>
                    <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto max-h-40">
                      {this.state.error.toString()}
                    </pre>
                  </details>
                )}
              </div>

              <div className="flex gap-3">
                <Button onClick={this.handleReset} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button onClick={this.handleGoHome} variant="default">
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
