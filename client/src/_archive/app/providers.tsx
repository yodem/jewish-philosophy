"use client";
import { SnackbarProvider } from 'notistack';
import { TooltipProvider } from '@/components/ui/tooltip';
import React from 'react';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
      <TooltipProvider>
        {children}
      </TooltipProvider>
    </SnackbarProvider>
  );
} 