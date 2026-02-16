
import React from 'react';
import { CLAY_SHADOW, CLAY_INSET, CLAY_BORDER } from '../constants';

interface ClayButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean;
  fullWidth?: boolean;
}

export const ClayButton: React.FC<ClayButtonProps> = ({ 
  children, 
  onClick, 
  className = "", 
  variant = 'primary', 
  disabled = false,
  fullWidth = false
}) => {
  const baseStyles = `rounded-[16px] py-4 px-6 font-semibold transition-all duration-200 active:scale-[0.98] ${CLAY_BORDER} flex items-center justify-center gap-2`;
  
  const variants = {
    primary: `bg-blue-400 text-white ${CLAY_SHADOW} hover:bg-blue-500 active:${CLAY_INSET}`,
    secondary: `bg-[#E0E9F5] text-blue-600 ${CLAY_SHADOW} hover:bg-blue-50 active:${CLAY_INSET}`,
    danger: `bg-red-400 text-white ${CLAY_SHADOW} hover:bg-red-500 active:${CLAY_INSET}`,
    ghost: `bg-transparent text-gray-500 active:${CLAY_INSET}`
  };

  const disabledStyles = "opacity-50 cursor-not-allowed grayscale active:scale-100";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${disabled ? disabledStyles : ""} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  );
};
