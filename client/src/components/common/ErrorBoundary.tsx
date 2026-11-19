import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 sm:p-8 max-w-md w-full text-center space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h2 className="text-base font-bold text-white tracking-tight">
                დაფიქსირდა შეცდომა
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                გვერდის ჩატვირთვისას მოხდა გაუთვალისწინებელი შეცდომა.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400 break-words text-left">
                {this.state.error.message}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-750 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>გვერდის განახლება</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
