
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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

  it('should call onSearchChange when input value changes', () => {
    const mockOnSearchChange = vi.fn();
    render(<SearchBar searchQuery="" onSearchChange={mockOnSearchChange} />);
    
    const input = screen.getByPlaceholderText('Search links...');
    fireEvent.change(input, { target: { value: 'new search' } });
    
    expect(mockOnSearchChange).toHaveBeenCalledWith('new search');
  });

  it('should render search icon', () => {
    const mockOnSearchChange = vi.fn();
    render(<SearchBar searchQuery="" onSearchChange={mockOnSearchChange} />);
    
    // The Search icon should be rendered
    const searchIcon = document.querySelector('svg');
    expect(searchIcon).toBeInTheDocument();
  });
});
