import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import Header from '../Header';

describe('Header Component', () => {
  const defaultProps = {
    isFirstInteraction: false,
    projectName: 'Test Project',
    isEditingProjectName: false,
    isHoveringProjectName: false,
    toggleAutonomySlider: jest.fn(),
    setIsEditingProjectName: jest.fn(),
    setIsHoveringProjectName: jest.fn(),
    handleProjectNameChange: jest.fn(),
    handleProjectNameBlur: jest.fn(),
  };

  it('renders WebSplat logo', () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByText('WebSplat')).toBeInTheDocument();
  });

  it('shows project name when not editing', () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByText('Test Project')).toBeInTheDocument();
  });

  it('shows input field when editing project name', () => {
    render(<Header {...defaultProps} isEditingProjectName={true} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('shows edit button on project name hover', () => {
    render(<Header {...defaultProps} isHoveringProjectName={true} />);
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
  });

  it('handles project name edit click', () => {
    render(<Header {...defaultProps} />);
    fireEvent.click(screen.getByText('Test Project'));
    expect(defaultProps.setIsEditingProjectName).toHaveBeenCalledWith(true);
  });

  it('handles autonomy slider toggle', () => {
    render(<Header {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /sliders/i }));
    expect(defaultProps.toggleAutonomySlider).toHaveBeenCalled();
  });

  it('handles project name hover', () => {
    render(<Header {...defaultProps} />);
    const projectNameContainer = screen.getByTestId('project-name-container');
    fireEvent.mouseEnter(projectNameContainer);
    expect(defaultProps.setIsHoveringProjectName).toHaveBeenCalledWith(true);
    fireEvent.mouseLeave(projectNameContainer);
    expect(defaultProps.setIsHoveringProjectName).toHaveBeenCalledWith(false);
  });

  it('handles project name change', () => {
    render(<Header {...defaultProps} isEditingProjectName={true} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'New Project Name' } });
    expect(defaultProps.handleProjectNameChange).toHaveBeenCalled();
  });

  it('handles project name blur', () => {
    render(<Header {...defaultProps} isEditingProjectName={true} />);
    const input = screen.getByRole('textbox');
    fireEvent.blur(input);
    expect(defaultProps.handleProjectNameBlur).toHaveBeenCalled();
  });

  it('shows pulsing animation for untitled projects', () => {
    render(<Header {...defaultProps} projectName="Untitled Project" />);
    const projectName = screen.getByText('Untitled Project');
    expect(projectName.className).toContain('animate-pulse');
  });

  it('hides project name during first interaction', () => {
    render(<Header {...defaultProps} isFirstInteraction={true} />);
    expect(screen.queryByText('Test Project')).not.toBeInTheDocument();
  });
});
