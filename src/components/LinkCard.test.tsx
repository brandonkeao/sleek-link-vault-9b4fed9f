
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { LinkCard } from './LinkCard';
import { Link } from '../types/Link';
import { supabase } from '../integrations/supabase/client';

// Mock Supabase
vi.mock('../integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn()
    }
  }
}));

// Mock toast hook
vi.mock('../hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

describe('LinkCard', () => {
  const mockLink: Link = {
    id: '1',
    url: 'https://example.com',
    title: 'Example Site',
    tags: ['tag1', 'tag2'],
    createdAt: new Date('2023-01-01'),
    favicon: 'https://example.com/favicon.ico'
  };

  const mockProps = {
    link: mockLink,
    isSelected: false,
    onSelect: vi.fn(),
    onClick: vi.fn(),
    onUpdate: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render link information correctly', () => {
    render(<LinkCard {...mockProps} />);
    
    expect(screen.getByText('Example Site')).toBeInTheDocument();
    expect(screen.getByText('https://example.com')).toBeInTheDocument();
    expect(screen.getByText('tag1')).toBeInTheDocument();
    expect(screen.getByText('tag2')).toBeInTheDocument();
  });

  it('should display favicon when available', () => {
    render(<LinkCard {...mockProps} />);
    
    const favicon = screen.getByRole('img');
    expect(favicon).toHaveAttribute('src', 'https://example.com/favicon.ico');
  });

  it('should handle favicon load errors', () => {
    render(<LinkCard {...mockProps} />);
    
    const favicon = screen.getByRole('img');
    fireEvent.error(favicon);
    
    expect(favicon).toHaveStyle('display: none');
  });

  it('should show selected state correctly', () => {
    render(<LinkCard {...mockProps} isSelected={true} />);
    
    const card = screen.getByRole('checkbox').closest('div');
    expect(card).toHaveClass('ring-2', 'ring-indigo-500');
  });

  it('should call onClick when card is clicked', async () => {
    const user = userEvent.setup();
    render(<LinkCard {...mockProps} />);
    
    const card = screen.getByText('Example Site').closest('div');
    await user.click(card!);
    
    expect(mockProps.onClick).toHaveBeenCalled();
  });

  it('should open link in new tab when URL is clicked', async () => {
    const user = userEvent.setup();
    const mockOpen = vi.fn();
    window.open = mockOpen;
    
    render(<LinkCard {...mockProps} />);
    
    const urlLink = screen.getByText('https://example.com');
    await user.click(urlLink);
    
    expect(mockOpen).toHaveBeenCalledWith('https://example.com', '_blank');
  });

  it('should handle checkbox selection', async () => {
    const user = userEvent.setup();
    render(<LinkCard {...mockProps} />);
    
    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);
    
    expect(mockProps.onSelect).toHaveBeenCalledWith(true);
  });

  it('should show shorten button when no short URL exists', () => {
    render(<LinkCard {...mockProps} />);
    
    expect(screen.getByText('Shorten')).toBeInTheDocument();
  });

  it('should show short URL when available', () => {
    const linkWithShortUrl = {
      ...mockLink,
      shortUrl: 'https://short.ly/abc'
    };
    
    render(<LinkCard {...mockProps} link={linkWithShortUrl} />);
    
    expect(screen.getByText('https://short.ly/abc')).toBeInTheDocument();
    expect(screen.queryByText('Shorten')).not.toBeInTheDocument();
  });

  it('should handle link shortening successfully', async () => {
    const user = userEvent.setup();
    const mockInvoke = vi.mocked(supabase.functions.invoke);
    mockInvoke.mockResolvedValue({
      data: {
        success: true,
        shortUrl: 'https://short.ly/abc',
        rebrandlyId: 'rebrandly123'
      },
      error: null
    });

    render(<LinkCard {...mockProps} />);
    
    const shortenButton = screen.getByText('Shorten');
    await user.click(shortenButton);
    
    expect(mockInvoke).toHaveBeenCalledWith('shorten-link', {
      body: { linkId: '1', url: 'https://example.com' }
    });
    
    await waitFor(() => {
      expect(mockProps.onUpdate).toHaveBeenCalledWith({
        ...mockLink,
        shortUrl: 'https://short.ly/abc',
        rebrandlyId: 'rebrandly123',
        shorteningStatus: 'shortened'
      });
    });
  });

  it('should handle link shortening errors', async () => {
    const user = userEvent.setup();
    const mockInvoke = vi.mocked(supabase.functions.invoke);
    mockInvoke.mockResolvedValue({
      data: {
        success: false,
        error: 'Shortening failed'
      },
      error: null
    });

    render(<LinkCard {...mockProps} />);
    
    const shortenButton = screen.getByText('Shorten');
    await user.click(shortenButton);
    
    // Should not call onUpdate on error
    expect(mockProps.onUpdate).not.toHaveBeenCalled();
  });

  it('should show loading state during shortening', async () => {
    const user = userEvent.setup();
    const mockInvoke = vi.mocked(supabase.functions.invoke);
    mockInvoke.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        data: { success: true, shortUrl: 'https://short.ly/abc', rebrandlyId: 'rebrandly123' },
        error: null
      }), 100))
    );

    render(<LinkCard {...mockProps} />);
    
    const shortenButton = screen.getByText('Shorten');
    await user.click(shortenButton);
    
    expect(screen.getByText('Shortening...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.queryByText('Shortening...')).not.toBeInTheDocument();
    });
  });

  it('should display relative time correctly', () => {
    render(<LinkCard {...mockProps} />);
    
    // Should show some form of time ago text
    expect(screen.getByText(/ago|just now/)).toBeInTheDocument();
  });

  it('should handle short URL clicks correctly', async () => {
    const user = userEvent.setup();
    const mockOpen = vi.fn();
    window.open = mockOpen;
    
    const linkWithShortUrl = {
      ...mockLink,
      shortUrl: 'short.ly/abc' // Without https prefix
    };
    
    render(<LinkCard {...mockProps} link={linkWithShortUrl} />);
    
    const shortUrlButton = screen.getByText('short.ly/abc');
    await user.click(shortUrlButton);
    
    expect(mockOpen).toHaveBeenCalledWith('https://short.ly/abc', '_blank', 'noopener,noreferrer');
  });
});
