import React from 'react';
import styled from 'styled-components';
import { useTheme } from '../../context/ThemeContext';

interface StyledButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

const StyledButton: React.FC<StyledButtonProps> = ({ onClick, children, className }) => {
  const { theme } = useTheme();
  
  return (
    <StyledWrapper theme={theme}>
      <button onClick={onClick} className={className}>
        {children}
      </button>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div<{ theme: any }>`
  button {
    color: ${props => props.theme.styledButtonText};
    padding: 0.7em 1.7em;
    font-size: 18px;
    border-radius: 0.5em;
    background: ${props => props.theme.styledButtonBg};
    cursor: pointer;
    border: 1px solid ${props => props.theme.styledButtonBorder};
    transition: all 0.3s;
    box-shadow: 6px 6px 12px ${props => props.theme.styledButtonShadowDark},
               -6px -6px 12px ${props => props.theme.styledButtonShadowLight};
  }

  button:hover {
    border: 1px solid ${props => props.theme.styledButtonHoverBorder};
  }

  button:active {
    box-shadow: 4px 4px 12px ${props => props.theme.styledButtonActiveShadowDark},
               -4px -4px 12px ${props => props.theme.styledButtonActiveShadowLight};
  }
`;

export default StyledButton;
