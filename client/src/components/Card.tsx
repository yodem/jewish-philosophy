import React from 'react';

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
};

const Card: React.FC<CardProps> = ({ className = '', children, style, ...props }) => (
  <div
    className={`bg-white rounded-xl shadow-lg p-6 flex flex-col items-center ${className}`}
    style={style}
    {...props}
  >
    {children}
  </div>
);

export default Card; 