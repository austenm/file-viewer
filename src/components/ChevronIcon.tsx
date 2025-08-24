import React from 'react';
import { cn } from '../utils/cn';

type ChevronIconProps = React.SVGProps<SVGSVGElement> & { open?: boolean };

const ChevronIcon = ({
  open = false,
  className = '',
  ...props
}: ChevronIconProps) => {
  const rotate = open ? 'rotate-90' : '';
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className={`h-4 w-4 ${rotate} ${className}`}
      className={cn('shrink-0', expanded ? 'rotate-90' : '', className)}
      {...props}
    >
      <path
        d="M7 5l6 5-6 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default ChevronIcon;
