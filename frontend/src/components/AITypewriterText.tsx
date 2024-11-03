import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

interface TypewriterTextProps {
  text: string;
}

const AITypewriterText: React.FC<TypewriterTextProps> = ({ text }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 30);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text]);

  useEffect(() => {
    setDisplayText('');
    setCurrentIndex(0);
  }, [text]);

  return (
    <StyledText>
      {displayText}
      {currentIndex < text.length && <Cursor>|</Cursor>}
    </StyledText>
  );
};

const StyledText = styled.span`
  font-family: 'GeistMono', monospace;
  font-size: 0.95rem;
  line-height: 1.5;
  white-space: pre-wrap;
`;

const Cursor = styled.span`
  opacity: 1;
  animation: blink 1s infinite;
  font-weight: 100;
  
  @keyframes blink {
    0% { opacity: 1; }
    50% { opacity: 0; }
    100% { opacity: 1; }
  }
`;

export default AITypewriterText;
