import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import MinimalAutonomyControl from '../MinimalAutonomyControl';

describe('MinimalAutonomyControl Component', () => {
  const defaultProps = {
    value: 50,
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders both slider and number input', () => {
    render(<MinimalAutonomyControl {...defaultProps} />);
    expect(screen.getByRole('slider')).toBeInTheDocument();
    expect(screen.getByRole('spinbutton')).toBeInTheDocument();
  });

  it('displays the current value in both inputs', () => {
    render(<MinimalAutonomyControl {...defaultProps} />);
    const slider = screen.getByRole('slider');
    const numberInput = screen.getByRole('spinbutton');

    expect(slider).toHaveValue('50');
    expect(numberInput).toHaveValue(50);
  });

  it('handles slider change', () => {
    render(<MinimalAutonomyControl {...defaultProps} />);
    const slider = screen.getByRole('slider');

    fireEvent.change(slider, { target: { value: '75' } });
    expect(defaultProps.onChange).toHaveBeenCalledWith(75);
  });

  it('handles number input change', () => {
    render(<MinimalAutonomyControl {...defaultProps} />);
    const numberInput = screen.getByRole('spinbutton');

    fireEvent.change(numberInput, { target: { value: '75' } });
    expect(defaultProps.onChange).toHaveBeenCalledWith(75);
  });

  it('enforces minimum value constraint', () => {
    render(<MinimalAutonomyControl {...defaultProps} />);
    const numberInput = screen.getByRole('spinbutton');

    expect(numberInput).toHaveAttribute('min', '0');
  });

  it('enforces maximum value constraint', () => {
    render(<MinimalAutonomyControl {...defaultProps} />);
    const numberInput = screen.getByRole('spinbutton');

    expect(numberInput).toHaveAttribute('max', '100');
  });

  it('applies correct gradient background style', () => {
    render(<MinimalAutonomyControl {...defaultProps} />);
    const slider = screen.getByRole('slider');
    
    const expectedBackground = 
      `linear-gradient(to right, #FFA500 0%, #FFA500 50%, #E5E5E5 50%, #E5E5E5 100%)`;
    
    expect(slider).toHaveStyle({ background: expectedBackground });
  });

  it('updates gradient background when value changes', () => {
    const { rerender } = render(<MinimalAutonomyControl {...defaultProps} />);
    const slider = screen.getByRole('slider');

    rerender(<MinimalAutonomyControl value={75} onChange={defaultProps.onChange} />);
    
    const expectedBackground = 
      `linear-gradient(to right, #FFA500 0%, #FFA500 75%, #E5E5E5 75%, #E5E5E5 100%)`;
    
    expect(slider).toHaveStyle({ background: expectedBackground });
  });

  it('maintains synchronized values between inputs', () => {
    render(<MinimalAutonomyControl {...defaultProps} />);
    const slider = screen.getByRole('slider');
    const numberInput = screen.getByRole('spinbutton');

    fireEvent.change(slider, { target: { value: '60' } });
    expect(numberInput).toHaveValue(60);

    fireEvent.change(numberInput, { target: { value: '70' } });
    expect(slider).toHaveValue('70');
  });

  it('applies correct styling classes', () => {
    render(<MinimalAutonomyControl {...defaultProps} />);
    const container = screen.getByRole('slider').parentElement;
    
    expect(container).toHaveClass('flex');
    expect(container).toHaveClass('items-center');
    expect(container).toHaveClass('space-x-2');
  });

  it('handles invalid number input', () => {
    render(<MinimalAutonomyControl {...defaultProps} />);
    const numberInput = screen.getByRole('spinbutton');

    fireEvent.change(numberInput, { target: { value: 'invalid' } });
    expect(defaultProps.onChange).not.toHaveBeenCalled();
  });

  it('handles empty number input', () => {
    render(<MinimalAutonomyControl {...defaultProps} />);
    const numberInput = screen.getByRole('spinbutton');

    fireEvent.change(numberInput, { target: { value: '' } });
    expect(defaultProps.onChange).not.toHaveBeenCalled();
  });

  it('maintains accessibility attributes', () => {
    render(<MinimalAutonomyControl {...defaultProps} />);
    const slider = screen.getByRole('slider');
    const numberInput = screen.getByRole('spinbutton');

    expect(slider).toHaveAttribute('type', 'range');
    expect(numberInput).toHaveAttribute('type', 'number');
    expect(slider).toHaveAttribute('min', '0');
    expect(slider).toHaveAttribute('max', '100');
  });
});
