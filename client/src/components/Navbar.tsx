'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NavbarHeader } from '../types';

interface NavbarProps {
  header?: NavbarHeader;
}

const Navbar: React.FC<NavbarProps> = ({ header }) => {
  const pathname = usePathname();
  const navLinks = header?.navigation
  
  return (
    <nav className="w-full bg-gray-900 text-white py-4 px-8 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-8">
        {header?.logo?.logoText && (
          <span className="text-xl font-bold">{header.logo.logoText}</span>
        )}
        {navLinks?.map((link) => {          
          return (
          <Link
            key={link.id}
            href={link.href}
            className={`text-lg font-semibold hover:text-blue-400 transition-colors ${pathname === link.href ? 'text-blue-400 underline' : ''}`}
          >
            {link.text}
          </Link>
        )})}
      </div>
      {header?.cta && (
        <Link
          href={header.cta.href}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          {header.cta.text}
        </Link>
      )}
    </nav>
  );
};

export default Navbar; 