import React from 'react';

interface VendorOSLogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  textColor?: string;
}

export const VendorOSLogo: React.FC<VendorOSLogoProps> = ({
  className = '',
  iconOnly = false,
  size = 'md',
  textColor = 'text-white',
}) => {
  const sizeMap = {
    sm: { icon: 'w-6 h-6', text: 'text-xs' },
    md: { icon: 'w-7 h-7', text: 'text-sm' },
    lg: { icon: 'w-9 h-9', text: 'text-base' },
    xl: { icon: 'w-12 h-12', text: 'text-xl' },
  };

  const dimensions = sizeMap[size] || sizeMap.md;

  return (
    <div className={`inline-flex items-center space-x-2.5 select-none ${className}`}>
      {/* Connected Node Mesh Logo Icon (Left Side) */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${dimensions.icon} flex-shrink-0 drop-shadow-md`}
      >
        {/* Connected Curved Mesh Paths */}
        <path
          d="M 28 35 Q 38 25 52 35 T 76 35"
          stroke="#6366F1"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M 28 35 Q 22 52 32 65 Q 48 78 52 65"
          stroke="#6366F1"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M 52 35 Q 68 48 76 58"
          stroke="#6366F1"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M 32 65 Q 42 75 52 82 Q 62 75 76 58"
          stroke="#6366F1"
          strokeWidth="10"
          strokeLinecap="round"
        />
        
        {/* Node Circles */}
        <circle cx="28" cy="35" r="9" fill="#6366F1" />
        <circle cx="52" cy="35" r="9" fill="#6366F1" />
        <circle cx="76" cy="35" r="9" fill="#6366F1" />
        <circle cx="32" cy="65" r="9" fill="#6366F1" />
        <circle cx="76" cy="58" r="9" fill="#6366F1" />
        <circle cx="52" cy="82" r="9" fill="#6366F1" />
      </svg>

      {/* Brand Text on Right Side */}
      {!iconOnly && (
        <span className={`font-mono font-bold tracking-tight ${dimensions.text} ${textColor}`}>
          VendorOS
        </span>
      )}
    </div>
  );
};

export default VendorOSLogo;
