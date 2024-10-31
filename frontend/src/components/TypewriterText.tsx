'use client';

import React, { useState, useEffect, useRef } from 'react';

interface TypewriterTextProps {
  text: string;
}

const TypewriterText: React.FC<TypewriterTextProps> = ({ text = '' }) => {
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const textToType = "Got a website concept? I'm here to assist.";

  useEffect(() => {
    let mounted = true;
    setDisplayText('');
    let currentIndex = 0;

    const typeNextCharacter = () => {
      if (!mounted) return;
      
      if (currentIndex < textToType.length) {
        setDisplayText(textToType.slice(0, currentIndex + 1));
        currentIndex++;
        intervalRef.current = setTimeout(typeNextCharacter, 31); 
      } else {
        // Hide cursor when typing is complete
        setShowCursor(false);
      }
    };

    typeNextCharacter();

    return () => {
      mounted = false;
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, []);

  return (
    <p className="text-[#AAAAAA] text-lg">
      {displayText}
      {showCursor && (
        <span 
          className="inline-block w-1.5 h-4 ml-0.5 bg-white animate-pulse"
          style={{ verticalAlign: 'middle' }}
        />
      )}
    </p>
  );
};

export default TypewriterText;
