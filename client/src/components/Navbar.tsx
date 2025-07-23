'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NavbarHeader } from '../types';
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink, NavigationMenuTrigger, NavigationMenuContent } from './ui/navigation-menu';
import { Sheet, SheetTrigger, SheetContent, SheetTitle } from './ui/sheet';
import { Button } from './ui/button';
import { useIsMobile } from '../hooks/use-mobile';
import { Menu as MenuIcon, Search } from 'lucide-react';
import { StrapiImage } from './StrapiImage';
import SearchDialog from './SearchDialog';

interface NavbarProps {
  header?: NavbarHeader;
}

const Navbar: React.FC<NavbarProps> = ({ header }) => {
  const pathname = usePathname();
  const navLinks = header?.navigation;
  const isMobile = useIsMobile();
  const [isSearchOpen, setIsSearchOpen] = useState(false);  

  return (
    <nav className="w-full bg-gray-900 text-white py-4 px-4 sm:px-8 flex items-center justify-between shadow-md">
      <div className="flex items-center">
        {!isMobile && navLinks && (
          <NavigationMenu className="hidden sm:flex sm:flex-row-reverse">
                  <div className="flex items-center justify-center flex-1 ml-4">
                    {header?.logo?.image?.url && (
                      <Link href="/">
                        <StrapiImage 
                          src={header.logo.image.url} 
                          alt={header.logo.logoText} 
                          width={40} 
                          height={40} 
                          className='cursor-pointer' 
                        />
                      </Link>
                    )}
                  </div>
            <NavigationMenuList>
              {navLinks.map((link) => (
                <React.Fragment key={link.id}>
                  {link.nestedLinks && link.nestedLinks.length > 0 ? (
                    <NavigationMenuItem>
                      <NavigationMenuTrigger dir='rtl' className={`bg-gray-900 font-semibold px-3 py-1 rounded transition-colors text-white hover:text-blue-400 data-[state=open]:text-blue-400 ${pathname === link.href ? 'text-blue-400 underline' : ''}`}>
                        {link.text}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent className="bg-gray-900 border text-right border-gray-700 shadow-lg">
                        <ul className="grid w-[250px] gap-1 p-2">
                          {link.nestedLinks.map((nestedLink) => (
                            <li key={nestedLink.id}>
                              <NavigationMenuLink asChild>
                                <Link
                                  href={nestedLink.href}
                                  className={`block text-sm font-medium px-3 py-2 rounded transition-colors text-white hover:text-blue-400 hover:bg-gray-800 ${pathname === nestedLink.href ? 'text-blue-400 bg-gray-800' : ''}`}
                                >
                                  {nestedLink.text}
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>

                  ) : (
                    <NavigationMenuItem>
                      <NavigationMenuLink asChild active={pathname === link.href}>
                        <Link
                          href={link.href}
                          className={`text-lg font-semibold px-3 py-1 rounded transition-colors text-white hover:text-blue-400 ${pathname === link.href ? 'text-blue-400 underline' : ''}`}
                        >
                          {link.text}
                        </Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>

                  )}
                </React.Fragment>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        )}
        {header?.cta && !isMobile && (
          <Link
            href={header.cta.href}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors ml-4"
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
            <SheetContent side="right" className="p-0 w-64 bg-gray-900 text-white">
              <SheetTitle><span className="sr-only">Main menu</span></SheetTitle>
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-800">
                  {header?.logo?.image?.url && (
                    <Link href="/">
                      <StrapiImage src={header.logo.image.url} alt={header.logo.logoText} width={40} height={40} className='cursor-pointer' />
                    </Link>
                  )}
                </div>
                <div className="flex flex-col gap-1 px-4 py-6">
                  {navLinks?.map((link) => (
                    <div key={link.id}>
                      {link.nestedLinks && link.nestedLinks.length > 0 ? (
                        <div className="space-y-1">
                          {link.href ? (
                            <Link
                              href={link.href}
                              className={`block text-lg font-semibold rounded px-2 py-2 transition-colors text-white hover:text-blue-400 hover:bg-gray-800 ${pathname === link.href ? 'text-blue-400 underline bg-gray-800' : ''}`}
                            >
                              {link.text}
                            </Link>
                          ) : (
                            <div className={`block text-lg font-semibold rounded px-2 py-2 transition-colors text-white hover:text-blue-400 hover:bg-gray-800 ${pathname === link.href ? 'text-blue-400 underline bg-gray-800' : ''}`}>
                              {link.text}
                            </div>
                          )}
                          <div className="ml-4 space-y-1">
                            {link.nestedLinks.map((nestedLink) => (
                              <Link
                                key={nestedLink.id}
                                href={nestedLink.href}
                                className={`block text-base font-medium rounded px-2 py-1 transition-colors text-white hover:text-blue-400 hover:bg-gray-800 ${pathname === nestedLink.href ? 'text-blue-400 underline bg-gray-800' : ''}`}
                              >
                                {nestedLink.text}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <Link
                          href={link.href}
                          className={`block text-lg font-semibold rounded px-2 py-2 transition-colors text-white hover:text-blue-400 hover:bg-gray-800 ${pathname === link.href ? 'text-blue-400 underline bg-gray-800' : ''}`}
                        >
                          {link.text}
                        </Link>
                      )}
                    </div>
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
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white hover:text-blue-400" 
          onClick={() => setIsSearchOpen(true)}
        >
          <Search className="size-6" />
          <span className="sr-only">Search</span>
        </Button>
      </div>
      {/* Search Dialog */}
      <SearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </nav>
  );
};

export default Navbar; 