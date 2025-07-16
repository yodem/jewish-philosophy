import React from 'react';
import Link from 'next/link';

const Navbar: React.FC = () => (
  <nav className="w-full bg-gray-900 text-white py-4 px-8 flex items-center justify-between shadow-md">
    <div className="flex items-center gap-8">
      <Link href="/" className="text-xl font-bold hover:text-blue-400 transition-colors">Home</Link>
      <Link href="/playlists" className="text-lg font-semibold hover:text-blue-400 transition-colors">Playlists</Link>
    </div>
    <div className="hidden md:flex items-center gap-4">
      {/* Add more nav items or user actions here if needed */}
    </div>
  </nav>
);

export default Navbar; 