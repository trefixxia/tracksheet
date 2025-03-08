import React from 'react';
import Image from 'next/image';

const Logo: React.FC = () => {
  return (
    <div className="h-14 w-auto">
      <Image 
        src="https://assets.co.dev/cb4131ac-f7a4-419e-994c-6a6f2f907c69/soundrank-2f76de4.png"
        alt="SOUNDRANK"
        width={240}
        height={56}
        className="h-full w-auto"
        priority
      />
    </div>
  );
};

export default Logo;