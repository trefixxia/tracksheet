import React from 'react';
import Image from 'next/image';

interface LogoProps {
  width?: number;
}

const Logo: React.FC<LogoProps> = ({ width = 240 }) => {
  // Calculate proportional height based on the new image ratio
  const height = Math.round(width * (56/240)); // Maintaining the same ratio
  
  return (
    <div style={{ width: `${width}px` }} className="h-auto">
      <Image 
        src="https://assets.co.dev/cb4131ac-f7a4-419e-994c-6a6f2f907c69/generated-image-march-18-2025---8_40pm.png-ddf508f.jpeg"
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