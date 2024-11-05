import React, { useState } from 'react';
import styled from 'styled-components';

const ToastContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: #4caf50;
  color: white;
  padding: 16px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 250px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  opacity: ${(props) => (props.show ? 1 : 0)};
  transition: opacity 0.3s ease-in-out;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  margin-left: 16px;
`;

const NotificationToast = ({ message }) => {
  const [show, setShow] = useState(true);

  const handleClose = () => {
    setShow(false);
  };

  if (!show) return null;

  return (
    <ToastContainer show={show}>
      <span>{message}</span>
      <CloseButton onClick={handleClose}>&times;</CloseButton>
    </ToastContainer>
  );
};

export default NotificationToast;