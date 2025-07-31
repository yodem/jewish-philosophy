import React from 'react';
import Link from 'next/link';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  as?: 'button' | 'a';
  href?: string;
  className?: string;
  children: React.ReactNode;
};

type AnchorProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

const baseClasses =
  'inline-block px-5 py-2 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-150 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 cursor-pointer hover:cursor-pointer';

const Button: React.FC<ButtonProps> = ({ as = 'button', href, className = '', children, ...props }) => {
  if ((as === 'a' || href)) {
    // Only pass anchor-appropriate props
    const anchorProps: AnchorProps = {
      href: href || '',
      className: `${baseClasses} ${className}`,
      ...props as React.AnchorHTMLAttributes<HTMLAnchorElement>,
    };
    return (
      <Link {...anchorProps}>{children}</Link>
    );
  }
  // Render as a button
  return (
    <button className={`${baseClasses} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button; 