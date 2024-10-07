import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost';
  size?: 'default' | 'icon';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'default', 
  size = 'default', 
  ...props 
}) => {
  return (
    <button 
      className={`button ${variant} ${size}`} 
      {...props}
    >
      {children}
    </button>
  );
};