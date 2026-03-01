import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 1 | 2 | 3;
}

export const Logo: React.FC<LogoProps> = ({ className = "w-8 h-8", variant = 1 }) => {
  // Variant 1: The Growth Pillar (Abstract 'B' + Rising Graph)
  // Represents: Growth, Structure, Stability
  if (variant === 1) {
    return (
      <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 26V6C6 4.89543 6.89543 4 8 4H14C18.4183 4 22 7.58172 22 12C22 13.8488 21.3728 15.5516 20.3159 16.906C22.5273 18.0663 24 20.3725 24 23C24 27.4183 20.4183 31 16 31H8C6.89543 31 6 30.1046 6 29V26Z" className="fill-indigo-600 dark:fill-indigo-500" fillOpacity="0.2"/>
        <path d="M10 26V10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M16 26V14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M22 23V19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    );
  }

  // Variant 2: The Coin Garden (Reference to Hanging Gardens + Wealth)
  // Represents: Flourishing Wealth, Organic Growth
  if (variant === 2) {
    return (
      <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="12" className="stroke-indigo-600 dark:stroke-indigo-400" strokeWidth="2"/>
        <path d="M16 22V10" className="stroke-indigo-600 dark:stroke-indigo-400" strokeWidth="2" strokeLinecap="round"/>
        <path d="M16 16L20 12" className="stroke-indigo-600 dark:stroke-indigo-400" strokeWidth="2" strokeLinecap="round"/>
        <path d="M16 16L12 12" className="stroke-indigo-600 dark:stroke-indigo-400" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="16" cy="16" r="3" className="fill-indigo-600 dark:fill-indigo-400"/>
      </svg>
    );
  }

  // Variant 3: The Ziggurat (Step Pyramid / Foundation)
  // Represents: Strong Foundation, Steps to Success
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 28H28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M8 28V20H24V28" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
      <path d="M12 20V12H20V20" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
      <path d="M15 12V6H17V12" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
      <circle cx="16" cy="6" r="2" className="fill-indigo-600 dark:fill-indigo-400"/>
    </svg>
  );
};