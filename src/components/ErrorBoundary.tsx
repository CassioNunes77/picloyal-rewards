import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    console.error("[ErrorBoundary] getDerivedStateFromError:", error.message);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary] componentDidCatch - Error:", error);
    console.error("[ErrorBoundary] Error message:", error.message);
    console.error("[ErrorBoundary] Error stack:", error.stack);
    console.error("[ErrorBoundary] Component stack:", errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-[200px] flex flex-col items-center justify-center p-6 bg-muted/50 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground text-center mb-2">
            Não foi possível carregar esta página. Tente recarregar.
          </p>
          {this.state.error && (
            <p className="text-xs text-destructive text-center mt-2">
              Erro: {this.state.error.message}
            </p>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
