'use client';

import { Component, ReactNode } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

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
                <Box display="flex" alignItems="center" justifyContent="center" p={4}>
                    <Box textAlign="center">
                        <Typography variant="h5" color="error" fontWeight={700} mb={2}>Something went wrong</Typography>
                        <Typography color="text.secondary" mb={2}>
                            {this.state.error?.message || 'An unexpected error occurred'}
                        </Typography>
                        <Button variant="contained" color="primary" onClick={() => this.setState({ hasError: false })}>
                            Try Again
                        </Button>
                    </Box>
                </Box>
            );
        }

        return this.props.children;
    }
}
