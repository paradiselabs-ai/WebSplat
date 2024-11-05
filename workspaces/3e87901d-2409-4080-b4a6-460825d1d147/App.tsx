import React, { useState } from 'react';
import styled from 'styled-components';

const ToastContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: #4CAF50;
  color: white;
  padding: 16px;
  border-radius: 4px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  z-index: 1000;

  @media (max-width: 600px) {
    top: auto;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
  }
`;

const Message = styled.span`
  margin-right: 16px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
`;

const NotificationToast = () => {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return null;

  return (
    <ToastContainer>
      <Message>Success! Your action was completed.</Message>
      <CloseButton onClick={() => setIsOpen(false)}>&times;</CloseButton>
    </ToastContainer>
  );
};

export default NotificationToast;