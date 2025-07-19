import React from 'react';

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="p-6 bg-red-900 border border-red-700 rounded-lg text-red-100">
                    <h3 className="text-lg font-semibold mb-2">Wystąpił błąd</h3>
                    <p className="mb-4">Wystąpił nieoczekiwany błąd w komponencie.</p>
                    <button
                        onClick={() => this.setState({ hasError: false, error: undefined })}
                        className="px-4 py-2 bg-red-700 hover:bg-red-600 rounded text-white"
                    >
                        Spróbuj ponownie
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
} 