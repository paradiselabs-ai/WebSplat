import React from 'react';

interface ButtonProps {
  label: string;
}

const Button: React.FC<ButtonProps> = ({ label }) => {
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
        transition: 'background-color 0.2s ease-in-out',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#0051c7';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#0070f3';
      }}
    >
      {label}
    </button>
  );
}

export default Button;