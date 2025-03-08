import React from 'react';
import Image from 'next/image';

interface LogoProps {
  height?: number;
}

const Logo: React.FC<LogoProps> = ({ height = 56 }) => {
  return (
    <div style={{ height: `${height}px` }} className="w-auto">
      <Image 
        src="https://assets.co.dev/cb4131ac-f7a4-419e-994c-6a6f2f907c69/soundrank-2f76de4.png"
        alt="SOUNDRANK"
        width={240}
        height={height}
        className="h-full w-auto"
        priority
      />
    </div>
  );
};

export default Logo;