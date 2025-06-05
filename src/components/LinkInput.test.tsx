
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { LinkInput } from './LinkInput';
import * as linkMetadata from '../utils/linkMetadata';

// Mock the linkMetadata utility
vi.mock('../utils/linkMetadata');

describe('LinkInput', () => {
  const mockOnAddLink = vi.fn();
  const mockFetchLinkMetadata = vi.mocked(linkMetadata.fetchLinkMetadata);

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchLinkMetadata.mockResolvedValue({
      title: 'Example Title',
      favicon: 'https://example.com/favicon.ico'
    });
  });

  it('should render input field with placeholder', () => {
    render(<LinkInput onAddLink={mockOnAddLink} />);
    
    const input = screen.getByPlaceholderText('Paste a URL to save...');
    expect(input).toBeInTheDocument();
  });

  it('should render save button', () => {
    render(<LinkInput onAddLink={mockOnAddLink} />);
    
    const button = screen.getByText('Save Link');
    expect(button).toBeInTheDocument();
  });

  it('should disable button when input is empty', () => {
    render(<LinkInput onAddLink={mockOnAddLink} />);
    
    const button = screen.getByText('Save Link');
    expect(button).toBeDisabled();
  });

  it('should enable button when input has value', async () => {
    const user = userEvent.setup();
    render(<LinkInput onAddLink={mockOnAddLink} />);
    
    const input = screen.getByPlaceholderText('Paste a URL to save...');
    await user.type(input, 'https://example.com');
    
    const button = screen.getByText('Save Link');
    expect(button).not.toBeDisabled();
  });

  it('should add https:// prefix to URLs without protocol', async () => {
    const user = userEvent.setup();
    render(<LinkInput onAddLink={mockOnAddLink} />);
    
    const input = screen.getByPlaceholderText('Paste a URL to save...');
    const button = screen.getByText('Save Link');
    
    await user.type(input, 'example.com');
    await user.click(button);
    
    await waitFor(() => {
      expect(mockFetchLinkMetadata).toHaveBeenCalledWith('https://example.com');
    });
  });

  it('should not modify URLs that already have protocol', async () => {
    const user = userEvent.setup();
    render(<LinkInput onAddLink={mockOnAddLink} />);
    
    const input = screen.getByPlaceholderText('Paste a URL to save...');
    const button = screen.getByText('Save Link');
    
    await user.type(input, 'https://example.com');
    await user.click(button);
    
    await waitFor(() => {
      expect(mockFetchLinkMetadata).toHaveBeenCalledWith('https://example.com');
    });
  });

  it('should call onAddLink with properly formatted link object', async () => {
    const user = userEvent.setup();
    render(<LinkInput onAddLink={mockOnAddLink} />);
    
    const input = screen.getByPlaceholderText('Paste a URL to save...');
    const button = screen.getByText('Save Link');
    
    await user.type(input, 'https://example.com');
    await user.click(button);
    
    await waitFor(() => {
      expect(mockOnAddLink).toHaveBeenCalledWith({
        id: expect.any(String),
        url: 'https://example.com',
        title: 'Example Title',
        tags: [],
        createdAt: expect.any(Date),
        favicon: 'https://example.com/favicon.ico'
      });
    });
  });

  it('should clear input after successful submission', async () => {
    const user = userEvent.setup();
    render(<LinkInput onAddLink={mockOnAddLink} />);
    
    const input = screen.getByPlaceholderText('Paste a URL to save...');
    const button = screen.getByText('Save Link');
    
    await user.type(input, 'https://example.com');
    await user.click(button);
    
    await waitFor(() => {
      expect(input).toHaveValue('');
    });
  });

  it('should show loading state during submission', async () => {
    const user = userEvent.setup();
    // Make the metadata fetch take some time
    mockFetchLinkMetadata.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        title: 'Example Title',
        favicon: 'https://example.com/favicon.ico'
      }), 100))
    );
    
    render(<LinkInput onAddLink={mockOnAddLink} />);
    
    const input = screen.getByPlaceholderText('Paste a URL to save...');
    const button = screen.getByText('Save Link');
    
    await user.type(input, 'https://example.com');
    await user.click(button);
    
    // Should show loading state
    expect(screen.getByText('Saving...')).toBeInTheDocument();
    expect(input).toBeDisabled();
    
    // Wait for completion
    await waitFor(() => {
      expect(screen.getByText('Save Link')).toBeInTheDocument();
    });
  });

  it('should handle metadata fetch errors gracefully', async () => {
    const user = userEvent.setup();
    mockFetchLinkMetadata.mockRejectedValue(new Error('Network error'));
    
    render(<LinkInput onAddLink={mockOnAddLink} />);
    
    const input = screen.getByPlaceholderText('Paste a URL to save...');
    const button = screen.getByText('Save Link');
    
    await user.type(input, 'https://example.com');
    await user.click(button);
    
    // Should not call onAddLink when there's an error
    await waitFor(() => {
      expect(mockOnAddLink).not.toHaveBeenCalled();
    });
    
    // Should return to normal state
    expect(screen.getByText('Save Link')).toBeInTheDocument();
    expect(input).not.toBeDisabled();
  });

  it('should prevent submission with only whitespace', async () => {
    const user = userEvent.setup();
    render(<LinkInput onAddLink={mockOnAddLink} />);
    
    const input = screen.getByPlaceholderText('Paste a URL to save...');
    const button = screen.getByText('Save Link');
    
    await user.type(input, '   ');
    await user.click(button);
    
    expect(mockFetchLinkMetadata).not.toHaveBeenCalled();
    expect(mockOnAddLink).not.toHaveBeenCalled();
  });

  it('should handle form submission via Enter key', async () => {
    const user = userEvent.setup();
    render(<LinkInput onAddLink={mockOnAddLink} />);
    
    const input = screen.getByPlaceholderText('Paste a URL to save...');
    
    await user.type(input, 'https://example.com');
    await user.keyboard('{Enter}');
    
    await waitFor(() => {
      expect(mockFetchLinkMetadata).toHaveBeenCalledWith('https://example.com');
    });
  });
});
