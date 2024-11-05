import React from 'react';
import styled from 'styled-components';

const StyledButton = styled.button`
  background-color: #0070f3;
  color: white;
  border: none; 
  border-radius: 4px;
  font-size: 1rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #0061c9;
  }
`;

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({ children, onClick }) => {
  return <StyledButton onClick={onClick}>{children}</StyledButton>;
};

export default Button;