'use client';

import React, { useState, useEffect } from 'react';

interface TypewriterTextProps {
  text: string;
}

const TypewriterText: React.FC<TypewriterTextProps> = ({ text = 'Got a website concept? I\'m here to assist.' }) => {
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  let timeoutId: NodeJS.Timeout;

  useEffect(() => {
    let currentIndex = 0;

    const typeNextCharacter = () => {
      if (currentIndex < text.length) {
        setDisplayText(text.slice(0, currentIndex + 1));
        currentIndex++;
        timeoutId = setTimeout(typeNextCharacter, 25);
      } else {
        timeoutId = setTimeout(() => setShowCursor(false), 800);
      }
    };

    timeoutId = setTimeout(typeNextCharacter, 400); // Delay start for fade-in effect

    return () => clearTimeout(timeoutId);
  }, [text]);

  return (
    <div className="relative opacity-0 animate-fade-in py-1">
      <div className="relative transition-transform duration-300 ease-out">
        <p className="relative text-2xl font-light tracking-wider bg-gradient-to-r from-white via-[#CCCCCC] to-[#888888] text-transparent bg-clip-text animate-gradient leading-relaxed">
          {displayText}
          {showCursor && (
            <span className="inline-block w-[2px] h-6 ml-[2px] bg-white animate-cursor-blink" style={{ verticalAlign: 'middle' }} />
          )}
        </p>
      </div>
      <style jsx>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes cursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes fadeIn {
          from { 
            opacity: 0;
            transform: translateY(10px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .animate-gradient {
          background-size: 200% auto;
          animation: gradientShift 8s ease infinite;
        }
        .animate-cursor-blink {
          animation: cursorBlink 1.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default TypewriterText;