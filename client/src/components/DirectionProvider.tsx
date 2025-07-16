'use client';
import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';

export type Direction = 'rtl' | 'ltr';

interface DirectionContextProps {
  direction: Direction;
  toggleDirection: () => void;
}

const DirectionContext = createContext<DirectionContextProps | undefined>(undefined);

export const useDirection = () => {
  const ctx = useContext(DirectionContext);
  if (!ctx) throw new Error('useDirection must be used within DirectionProvider');
  return ctx;
};

export const DirectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [direction, setDirection] = useState<Direction>('rtl');

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('mui-direction') : null;
    if (stored === 'rtl' || stored === 'ltr') {
      setDirection(stored);
    }
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('dir', direction);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('mui-direction', direction);
    }
  }, [direction]);

  const toggleDirection = useMemo(() => () => {
    setDirection((prev) => (prev === 'rtl' ? 'ltr' : 'rtl'));
  }, []);

  const value = useMemo(() => ({ direction, toggleDirection }), [direction, toggleDirection]);

  return (
    <DirectionContext.Provider value={value}>{children}</DirectionContext.Provider>
  );
}; 