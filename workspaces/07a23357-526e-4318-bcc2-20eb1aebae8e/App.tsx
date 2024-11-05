import React from 'react';

const Button: React.FC = () => {
  return (
    <button 
      style={{
        backgroundColor: '#0070f3',
        color: 'white', 
        border: 'none',
        borderRadius: '5px',
        padding: '10px 20px',
        fontSize: '16px',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
        ':hover': {
          backgroundColor: '#0060d9'
        }
      }}
    >
      Click me
    </button>
  );
}

export default Button;