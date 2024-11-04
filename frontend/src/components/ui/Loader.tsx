import React from 'react';
import styled from 'styled-components';
import { useTheme } from '../../context/ThemeContext';

interface LoaderProps {
  isThinking: boolean;
}

const Loader: React.FC<LoaderProps> = ({ isThinking }) => {
  const { theme } = useTheme();
  
  return (
    <StyledWrapper $isThinking={isThinking} theme={theme}>
      <div className="meteor" />
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div<{ $isThinking: boolean; theme: any }>`
  position: absolute;
  bottom: -2px;
  left: 1px;
  width: 15px; 
  height: 15px; 
  z-index: 10;

  @keyframes spin {
    0% {
      transform: rotateY(0deg) translateZ(0);
    }
    100% {
      transform: rotateY(360deg) translateZ(0);
    }
  }

  .meteor {
    width: 100%;
    height: 100%;
    background: linear-gradient(
      135deg,
      var(--loaderGradientStart) 0%,
      var(--loaderGradientEnd) 100%
    );
    border-radius: 50%;
    position: relative;
    animation: ${props => props.$isThinking ? 'spin 3s linear infinite' : 'none'};
    box-shadow: 0 0 7px 5px var(--loaderGlowPrimary), 0 0 7px 1px var(--loaderGlowSecondary);
    
    transform-style: preserve-3d;
    transition: transform 0.3s ease-out, box-shadow 0.3s ease;

    &:hover {
      transform: ${props => !props.$isThinking ? 'rotateY(180deg)' : 'none'};
    }
  }

  .meteor::before,
  .meteor::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 50%;
    background: inherit;
  }

  .meteor::before {
    transform: translateZ(-5px);
  }

  .meteor::after {
    transform: translateZ(5px);
  }
`;

export default Loader;