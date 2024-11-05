import React, { useState } from 'react';
import styled from 'styled-components';

const ToastWrapper = styled.div`
  position: fixed; 
  top: 20px;
  right: 20px;
  background-color: #4CAF50;
  color: white;
  padding: 16px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  box-shadow: 0px 3px 5px -1px rgba(0,0,0,0.2), 
              0px 6px 10px 0px rgba(0,0,0,0.14), 
              0px 1px 18px 0px rgba(0,0,0,0.12);
`;

const Message = styled.span`
  margin-right: 12px;
`;

const CloseButton = styled.button`
  margin-left: auto;
  border: none;
  background: transparent;
  color: white;
  cursor: pointer;
`;

interface NotificationToastProps {
  message: string;
  duration?: number;
  onClose?: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ 
  message,
  duration = 3000,
  onClose,
}) => {
  const [visible, setVisible] = useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  if (!visible) return null;

  return (
    <ToastWrapper>
      <Message>{message}</Message>
      <CloseButton onClick={() => {
        setVisible(false);
        onClose?.();
      }}>X</CloseButton>
    </ToastWrapper>
  );
};