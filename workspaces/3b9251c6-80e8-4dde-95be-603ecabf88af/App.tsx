import React from 'react';
import styled from 'styled-components';

const StyledButton = styled.button`
  background-color: #1e88e5;
  border: none;
  color: white;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  cursor: pointer;
  border-radius: 8px;
  transition-duration: 0.4s;

  &:hover {
    background-color: #1565c0;
    box-shadow: 0 12px 16px 0 rgba(0,0,0,0.24), 0 17px 50px 0 rgba(0,0,0,0.19);
  }

  @media (max-width: 600px) {
    padding: 12px 24px;
    font-size: 14px;
  }
`;

const Button = ({children}) => {
  return (
    <StyledButton>{children}</StyledButton>
  );
}

export default Button;