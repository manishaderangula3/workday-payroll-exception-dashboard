import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  errorMessage: string | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    errorMessage: null
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      errorMessage: error.message || "The dashboard encountered an unexpected error."
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Dashboard runtime error", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ errorMessage: null });
  };

  render() {
    if (!this.state.errorMessage) {
      return this.props.children;
    }

    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
        <section className="w-full max-w-xl rounded-lg border border-red-100 bg-white p-6 shadow-panel">
          <div className="flex gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-red-50 text-red-700">
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-red-700">Dashboard Error</p>
              <h1 className="mt-1 text-xl font-semibold text-workday-ink">Something interrupted the view</h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                The dashboard kept the page open, but one view failed to render. Reset the view and try again. If this
                happened after a file upload, verify the CSV headers and values.
              </p>
              <p className="mt-3 rounded-md bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
                {this.state.errorMessage}
              </p>
            </div>
          </div>

          <button
            className="mt-5 inline-flex h-10 items-center gap-2 rounded-md bg-workday-blue px-4 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-workday-blue focus:ring-offset-2"
            onClick={this.handleReset}
            type="button"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset View
          </button>
        </section>
      </main>
    );
  }
}
