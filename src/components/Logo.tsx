import React from 'react';
import Image from 'next/image';

interface LogoProps {
  width?: number;
}

const Logo: React.FC<LogoProps> = ({ width = 240 }) => {
  // Calculate proportional height (original ratio is 240:56)
  const height = Math.round(width * (56/240));
  
  return (
    <div style={{ width: `${width}px` }} className="h-auto">
      <Image 
        src="https://assets.co.dev/cb4131ac-f7a4-419e-994c-6a6f2f907c69/soundrank-2f76de4.png"
        alt="SOUNDRANK"
        width={width}
        height={height}
        className="w-full h-auto"
        priority
      />
    </div>
  );
};

export default Logo;