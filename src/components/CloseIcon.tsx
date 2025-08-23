import React from 'react';

type CloseIconProps = React.SVGProps<SVGSVGElement> & {
  size?: number | string;
};

const CloseIcon = ({ size = 12, ...props }: CloseIconProps) => {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={'currentColor'}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
};

export default CloseIcon;
