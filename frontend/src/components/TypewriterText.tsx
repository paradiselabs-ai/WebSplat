'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';

interface TypewriterTextProps {
  text?: string;
  className?: string;
}

const TypewriterText = ({ 
  text = 'Got a website concept? I\'m here to assist.',
  className = ''
}: TypewriterTextProps) => {
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const { themeType } = useTheme();

  const typeNextCharacter = useCallback((currentIndex: number) => {
    if (currentIndex < text.length) {
      setDisplayText(text.slice(0, currentIndex + 1));
      return true;
    }
    return false;
  }, [text]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let currentIndex = 0;

    const animate = () => {
      if (typeNextCharacter(currentIndex)) {
        currentIndex++;
        timeoutId = setTimeout(animate, Math.random() * 30 + 20); // Varying speed
      } else {
        timeoutId = setTimeout(() => setShowCursor(false), 800);
      }
    };

    // Initial visibility transition
    setIsVisible(true);
    
    // Start typing after initial fade-in
    timeoutId = setTimeout(animate, 400);

    return () => clearTimeout(timeoutId);
  }, [text, typeNextCharacter]);

  const gradientColors = themeType === 'dark' 
    ? 'from-white via-white to-[#4DB9CF]'
    : 'from-blue-800 via-blue-900 to-[#00B4B5]' /* [#00B4B5] */

  return (
    <div className={`transform transition-all duration-7000 ease-out ${
      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
    } ${className}`}>
      <div className="relative">
        <p className="font-serif text-lg md:text-[1.4rem] tracking-wide leading-relaxed">
          <span className={`bg-gradient-to-r ${gradientColors} bg-clip-text text-transparent animate-gradient`}>
            {displayText}
          </span>
          {showCursor && (
            <span 
              className={`inline-block w-0.5 h-5 md:h-7 ml animate-cursor-blink ${
                themeType === 'dark' ? 'bg-blue-300' : 'bg-gray-700'
              }`}
              style={{ verticalAlign: 'middle' }}
            />
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
          0%, 100% { opacity: 1; transform: scaleY(1); }
          50% { opacity: 0.4; transform: scaleY(0.85); }
        }

        .animate-gradient {
          background-size: 200% auto;
          animation: gradientShift 4s ease infinite;
        }

        .animate-cursor-blink {
          animation: cursorBlink 0.8s ease-in-out infinite;
          transform-origin: bottom;
        }
      `}</style>
    </div>
  );
};

export default TypewriterText;
