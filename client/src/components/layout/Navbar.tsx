'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NavbarHeader } from '@/types';
import { Sheet, SheetTrigger, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu as MenuIcon, Search } from 'lucide-react';
import { StrapiImage } from '@/components/shared/StrapiImage';
import SearchDialog from '@/components/content/SearchDialog';
import ThemeToggle from '@/components/shared/ThemeToggle';

interface NavbarProps {
  header?: NavbarHeader;
}

const Navbar: React.FC<NavbarProps> = ({ header }) => {
  const pathname = usePathname();
  const navLinks = header?.navigation;
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <nav className="w-full bg-[oklch(0.24_0.11_265)] text-white py-4 px-4 sm:px-8 flex items-center justify-between shadow-lg border-b border-white/10 sticky top-0 z-50">
      <div className="flex justify-between items-center gap-6">
        {/* Logo */}
        {header?.logo?.image?.url && (
          <Link href="/" className="flex items-center">
            <StrapiImage
              src={header.logo.image.url}
              alt={header.logo.logoText}
              width={200}
              height={60}
              className='cursor-pointer'
            />
          </Link>
        )}
        {/* Desktop Navigation */}
        {navLinks && (
          <div className="hidden md:flex items-center gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                className={`text-[16px] font-medium px-2 py-1 rounded-lg transition-all ${
                  pathname === link.href
                    ? 'text-white border-b-2 border-accent pb-1'
                    : 'text-white/70 hover:text-white hover:bg-accent/20'
                }`}
              >
                {link.text}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Search Button */}
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:text-white hover:bg-accent/20"
          onClick={() => setIsSearchOpen(true)}
        >
          <Search className="size-6" />
          <span className="sr-only">Search</span>
        </Button>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:text-white hover:bg-accent/20">
                <MenuIcon className="size-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0 w-64 bg-[oklch(0.24_0.11_265)] text-white">
              <SheetTitle><span className="sr-only">Main menu</span></SheetTitle>
              <div className="flex flex-col h-full">
                {/* Mobile Logo */}
                <div className="flex items-center gap-3 px-4 py-4 border-b border-primary/60">
                  {header?.logo?.image?.url && (
                    <Link href="/">
                      <StrapiImage
                        src={header.logo.image.url}
                        alt={header.logo.logoText}
                        width={200}
                        height={60}
                        className='cursor-pointer'
                      />
                    </Link>
                  )}
                </div>

                {/* Mobile Navigation */}
                <div className="flex flex-col gap-1 px-4 py-6">
                  {navLinks?.map((link) => (
                    <Link
                      key={link.id}
                      href={link.href}
                      className={`block text-lg font-medium rounded-lg px-2 py-2 transition-all ${
                        pathname === link.href
                          ? 'text-white border-b-2 border-accent bg-accent/20'
                          : 'text-white/70 hover:text-white hover:bg-accent/20'
                      }`}
                    >
                      {link.text}
                    </Link>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Search Dialog */}
      <SearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </nav>
  );
};

export default Navbar;
