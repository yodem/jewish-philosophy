"use client";
import { SnackbarProvider } from 'notistack';
import React from 'react';

export default function ClientSnackbarProvider({ children }: { children: React.ReactNode }) {
  return React.createElement(SnackbarProvider, { maxSnack: 3, anchorOrigin: { vertical: 'top', horizontal: 'center' } }, children);
} 