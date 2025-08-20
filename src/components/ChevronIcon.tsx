import React from 'react';

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
