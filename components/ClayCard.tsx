
import React from 'react';
import { CLAY_SHADOW, CLAY_BORDER } from '../constants';

interface ClayCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: string;
}

export const ClayCard: React.FC<ClayCardProps> = ({ children, className = "", padding = "p-6" }) => {
  return (
    <div className={`bg-[#E0E9F5] rounded-[24px] ${CLAY_SHADOW} ${CLAY_BORDER} ${padding} ${className}`}>
      {children}
    </div>
  );
};
