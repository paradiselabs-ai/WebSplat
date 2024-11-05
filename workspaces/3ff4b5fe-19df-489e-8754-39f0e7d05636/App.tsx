import React, { useState } from 'react';
import styled from 'styled-components';

const ToastWrapper = styled.div`
  position: fixed; 
  bottom: 20px;
  right: 20px;
  background-color: #4CAF50;
  color: white;
  padding: 16px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.2);
  opacity: ${props => props.show ? 1 : 0};
  transition: opacity 0.3s ease-in-out;
`;

const Message = styled.div`
  margin-right: 16px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
`;

const NotificationToast = ({ message }) => {
  const [show, setShow] = useState(true);

  const handleClose = () => {
    setShow(false);
  };

  return (
    <ToastWrapper show={show}>
      <Message>{message}</Message>
      <CloseButton onClick={handleClose}>&times;</CloseButton>
    </ToastWrapper>
  );
};

export default NotificationToast;