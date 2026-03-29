'use client';

import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <nav className="w-full bg-navbar text-navbar-foreground py-4 px-4 sm:px-8 flex items-center justify-between shadow-lg border-b border-white/10 sticky top-0 z-50">
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
          <div className="hidden lg:flex items-center gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                className={`text-[16px] font-medium px-2 py-1 rounded transition-colors duration-150 ${
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

        {/* Desktop Search Bar */}
        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          className="hidden lg:flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg px-3 py-1.5 text-white/50 text-sm transition-colors cursor-pointer min-w-[200px]"
        >
          <Search className="size-4 shrink-0" />
          <span>חיפוש...</span>
          <kbd className="mr-auto text-[10px] bg-white/10 rounded px-1.5 py-0.5 font-mono">⌘K</kbd>
        </button>

        {/* Mobile Search Button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden text-white hover:text-white hover:bg-accent/20"
          onClick={() => setIsSearchOpen(true)}
        >
          <Search className="size-6" />
          <span className="sr-only">Search</span>
        </Button>

        {/* Mobile Menu */}
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:text-white hover:bg-accent/20">
                <MenuIcon className="size-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0 w-64 bg-navbar text-navbar-foreground">
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
                      className={`block text-lg font-medium rounded px-2 py-2 transition-colors duration-150 ${
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
