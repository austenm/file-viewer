import { Component, type ReactNode } from 'react';

type Props = {
  resetKey: string | null;
  fallback?: ReactNode;
  children: ReactNode;
};
type State = { hasError: boolean; error?: Error };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('[ErrorBoundary]', error, info);
    }
  }

  componentDidUpdate(prev: Props) {
    if (this.props.resetKey !== prev.resetKey && this.state.hasError) {
      this.setState({ hasError: false, error: undefined });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="p-4 text-sm">
            <div className="font-semibold mb-1">Something went wrong.</div>
            <pre className="whitespace-pre-wrap text-xs opacity-70">
              {this.state.error?.message}
            </pre>
            <button
              className="mt-3 rounded-2xl border px-3 py-1.5"
              onClick={() =>
                this.setState({ hasError: false, error: undefined })
              }
            >
              Try again
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
