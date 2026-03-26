'use client';

import { Component, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex items-center justify-center p-8">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-destructive mb-4">משהו השתבש</h2>
                        <p className="text-muted-foreground mb-4">
                            {this.state.error?.message || 'אירעה שגיאה בלתי צפויה'}
                        </p>
                        <button
                            className="px-4 py-2 bg-accent text-white rounded hover:bg-accent/80"
                            onClick={() => this.setState({ hasError: false })}
                        >
                            נסו שוב
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
