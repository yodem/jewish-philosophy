'use client';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from '@mui/stylis-plugin-rtl';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import React, { useMemo } from 'react';
import { useDirection } from './DirectionProvider';
import baseTheme from '../theme';

const rtlCache = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});
const ltrCache = createCache({
  key: 'muiltr',
  stylisPlugins: [prefixer],
});

const ClientThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { direction } = useDirection();
  const theme = useMemo(() => createTheme({ ...baseTheme, direction }), [direction]);
  const cache = direction === 'rtl' ? rtlCache : ltrCache;

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </CacheProvider>
  );
};

export default ClientThemeProvider; 