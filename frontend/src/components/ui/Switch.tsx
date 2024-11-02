import React from 'react';
import styled from 'styled-components';

interface SwitchProps {
  checked: boolean;
  onChange: () => void;
}

const Switch: React.FC<SwitchProps> = ({ checked, onChange }) => {
  return (
    <StyledWrapper>
      <input 
        type="checkbox" 
        id="checkbox" 
        checked={checked}
        onChange={onChange}
      />
      <label htmlFor="checkbox" className="label" />
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .label {
    height: 15px;
    width: 30px;
    background-color: #ffffff;
    border-radius: 7.5px;
    box-shadow: inset 0 0 2.5px 1px rgba(255, 255, 255, 1),
      inset 0 0 5px 0.5px rgba(0, 0, 0, 0.3), 2.5px 5px 7.5px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    cursor: pointer;
    position: relative;
    transition: transform 0.4s;
  }

  .label:hover {
    transform: perspective(25px) rotateX(5deg) rotateY(-5deg);
  }

  #checkbox:checked ~ .label:hover {
    transform: perspective(25px) rotateX(-5deg) rotateY(5deg);
  }

  #checkbox {
    display: none;
  }

  #checkbox:checked ~ .label::before {
    left: 15px;
    background-color: #000000;
    background-image: linear-gradient(315deg, #000000 0%, #414141 70%);
    transition: 0.4s;
  }

  .label::before {
    position: absolute;
    content: "";
    height: 10px;
    width: 10px;
    border-radius: 50%;
    background-color: #000000;
    background-image: linear-gradient(
      130deg,
      #757272 10%,
      #ffffff 11%,
      #1E3B91 52%
    );
    left: 2.5px;
    box-shadow: 0 1px 0.5px rgba(0, 0, 0, 0.3), 2.5px 2.5px 2.5px rgba(0, 0, 0, 0.3);
    transition: 0.4s;
  }
`;

export default Switch;