import React, { useState } from 'react';

interface Props {
  message: string;
}

const NotificationToast: React.FC<Props> = ({ message }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="notification-toast">
      <div className="message">{message}</div>
      <button onClick={() => setIsVisible(false)}>Close</button>
      <style jsx>{`
        .notification-toast {
          background-color: #4CAF50;
          color: white;
          padding: 16px;
          position: fixed;
          bottom: 30px;
          right: 30px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 400px;
        }
        
        .message {
          flex: 1;
          margin-right: 16px;
        }

        button {
          background: none;
          border: 1px solid white;
          color: white;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
        }

        @media (max-width: 600px) {
          .notification-toast {
            max-width: 80%;
            left: 10%;
            right: 10%;
          }
        }
      `}</style>
    </div>
  );
}

export default NotificationToast;