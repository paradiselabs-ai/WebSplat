import React from 'react';
import styled from 'styled-components';

interface StyledButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

const StyledButton: React.FC<StyledButtonProps> = ({ onClick, children, className }) => {
  return (
    <StyledWrapper>
      <button onClick={onClick} className={className}>
        {children}
      </button>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  button {
    color: #090909;
    padding: 0.7em 1.7em;
    font-size: 18px;
    border-radius: 0.5em;
    background: #e8e8e8;
    cursor: pointer;
    border: 1px solid #e8e8e8;
    transition: all 0.3s;
    box-shadow: 6px 6px 12px #c5c5c5, -6px -6px 12px #ffffff;
  }

  button:hover {
    border: 1px solid white;
  }

  button:active {
    box-shadow: 4px 4px 12px #c5c5c5, -4px -4px 12px #ffffff;
  }
`;

export default StyledButton;
