'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NavbarHeader } from '../types';
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink } from './ui/navigation-menu';
import { Sheet, SheetTrigger, SheetContent } from './ui/sheet';
import { Button } from './ui/button';
import { useIsMobile } from '../hooks/use-mobile';
import { Menu as MenuIcon } from 'lucide-react';
import { StrapiImage } from './StrapiImage';

interface NavbarProps {
  header?: NavbarHeader;
}

const Navbar: React.FC<NavbarProps> = ({ header }) => {
  const pathname = usePathname();
  const navLinks = header?.navigation;
  const isMobile = useIsMobile();

  return (
    <nav className="w-full bg-gray-900 text-white py-4 px-4 sm:px-8 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-4 sm:gap-8">
        {header?.logo?.image?.url && (
          <Link href="/">
            <StrapiImage src={header.logo.image.url} alt={header.logo.logoText} width={40} height={40} className='cursor-pointer' />
          </Link>
        )}
        {!isMobile && navLinks && (
          <NavigationMenu className="hidden sm:flex">
            <NavigationMenuList>
              {navLinks.map((link) => (
                <NavigationMenuItem key={link.id}>
                  <NavigationMenuLink asChild active={pathname === link.href}>
                    <Link
                      href={link.href}
                      className={`text-lg font-semibold px-3 py-1 rounded transition-colors ${pathname === link.href ? 'text-blue-400 underline' : 'hover:text-blue-400'}`}
                    >
                      {link.text}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        )}
      </div>
      {/* CTA and Mobile Menu */}
      <div className="flex items-center gap-2">
        {header?.cta && !isMobile && (
          <Link
            href={header.cta.href}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            {header.cta.text}
          </Link>
        )}
        {isMobile && (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white">
                <MenuIcon className="size-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 bg-gray-900 text-white">
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-800">
                  {header?.logo?.logoText && (
                    <span className="text-xl font-bold whitespace-nowrap">{header.logo.logoText}</span>
                  )}
                </div>
                <div className="flex flex-col gap-1 px-4 py-6">
                  {navLinks?.map((link) => (
                    <Link
                      key={link.id}
                      href={link.href}
                      className={`block text-lg font-semibold rounded px-2 py-2 transition-colors ${pathname === link.href ? 'text-blue-400 underline' : 'hover:text-blue-400'}`}
                    >
                      {link.text}
                    </Link>
                  ))}
                </div>
                {header?.cta && (
                  <div className="mt-auto px-4 pb-6">
                    <Link
                      href={header.cta.href}
                      className="block w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-center transition-colors"
                    >
                      {header.cta.text}
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 