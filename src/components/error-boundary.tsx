"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  name?: string;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 flex flex-col items-center justify-center min-h-[200px] text-center">
          <AlertTriangle className="w-10 h-10 text-amber-500/80 mb-3" />
          <p className="text-sm font-medium text-zinc-400">
            This section couldn’t load. Refresh the page to try again.
          </p>
          {this.props.name && (
            <p className="text-xs text-zinc-500 mt-1">{this.props.name}</p>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
