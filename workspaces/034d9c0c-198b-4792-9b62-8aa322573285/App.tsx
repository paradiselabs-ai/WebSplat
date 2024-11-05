import React, { useState } from 'react';

interface ToastProps {
  message: string;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    onClose();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="toast-container">
      <div className="toast-content">
        <span className="toast-message">{message}</span>
        <button className="toast-close" onClick={handleClose}>
          &times;
        </button>
      </div>
      <style jsx>{`
        .toast-container {
          position: fixed;
          top: 20px;
          right: 20px;
          background-color: #4caf50;
          color: white;
          padding: 16px;
          border-radius: 4px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
          opacity: 0.9;
          z-index: 9999;
        }

        .toast-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .toast-message {
          margin-right: 16px;
        }

        .toast-close {
          background: none;
          border: none;
          color: white;
          font-size: 20px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default Toast;