import React from 'react';
import { cn } from '../utils/cn';

type ChevronIconProps = React.SVGProps<SVGSVGElement> & {
  expanded?: boolean;
  size?: number;
  strokeWidth?: number;
};

const ChevronIcon = ({
  expanded = false,
  size = 14,
  strokeWidth = 2,
  className = '',
  ...props
}: ChevronIconProps) => {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('shrink-0', expanded ? 'rotate-90' : '', className)}
      {...props}
    >
      <path d="M7 5l6 5-6 5" />
    </svg>
  );
};

export default ChevronIcon;
