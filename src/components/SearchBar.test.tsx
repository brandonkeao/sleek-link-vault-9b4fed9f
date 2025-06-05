
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { SearchBar } from './SearchBar';

describe('SearchBar', () => {
  it('should render with placeholder text', () => {
    const mockOnSearchChange = vi.fn();
    render(<SearchBar searchQuery="" onSearchChange={mockOnSearchChange} />);
    
    const input = screen.getByPlaceholderText('Search links...');
    expect(input).toBeInTheDocument();
  });

  it('should display the current search query', () => {
    const mockOnSearchChange = vi.fn();
    render(<SearchBar searchQuery="test query" onSearchChange={mockOnSearchChange} />);
    
    const input = screen.getByDisplayValue('test query');
    expect(input).toBeInTheDocument();
  });

  it('should call onSearchChange when input value changes', async () => {
    const user = userEvent.setup();
    const mockOnSearchChange = vi.fn();
    render(<SearchBar searchQuery="" onSearchChange={mockOnSearchChange} />);
    
    const input = screen.getByPlaceholderText('Search links...');
    await user.type(input, 'new search');
    
    expect(mockOnSearchChange).toHaveBeenCalled();
  });

  it('should render search icon', () => {
    const mockOnSearchChange = vi.fn();
    render(<SearchBar searchQuery="" onSearchChange={mockOnSearchChange} />);
    
    // The Search icon should be rendered
    const searchIcon = document.querySelector('svg');
    expect(searchIcon).toBeInTheDocument();
  });
});
