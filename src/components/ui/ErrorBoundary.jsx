import { AlertTriangle, RefreshCw, RotateCcw } from 'lucide-react';
import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    try {
      localStorage.removeItem('college-user');
      localStorage.removeItem('saas-user');
    } catch (e) {}
    window.location.href = '/login';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
          <div className="w-full max-w-md rounded-3xl border border-rose-500/30 bg-slate-900 p-8 text-center shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400 mb-4">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-xl font-black text-white">Something Went Wrong</h2>
            <p className="mt-2 text-xs text-slate-400">
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 py-3 text-sm font-bold text-white hover:bg-sky-400 transition"
              >
                <RotateCcw size={16} />
                Reset Session & Login
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
              >
                <RefreshCw size={14} />
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
