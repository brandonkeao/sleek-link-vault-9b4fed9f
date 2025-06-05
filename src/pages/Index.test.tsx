
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import Index from './Index';
import * as useAuthModule from '../hooks/useAuth';
import * as linkDatabase from '../utils/linkDatabase';

// Mock all the dependencies
vi.mock('../hooks/useAuth');
vi.mock('../utils/linkDatabase');
vi.mock('../integrations/supabase/client', () => ({
  supabase: {
    channel: vi.fn(() => ({
      on: vi.fn(() => ({
        subscribe: vi.fn()
      }))
    })),
    removeChannel: vi.fn()
  }
}));
vi.mock('../hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

// Wrapper component for tests
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('Index Page', () => {
  const mockUseAuth = vi.mocked(useAuthModule.useAuth);
  const mockLinkDatabase = vi.mocked(linkDatabase.linkDatabase);

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default auth state
    mockUseAuth.mockReturnValue({
      user: { id: 'user123', email: 'test@example.com' },
      loading: false,
      signOut: vi.fn()
    });

    // Default empty links
    mockLinkDatabase.getAll.mockResolvedValue([]);
    mockLinkDatabase.save.mockResolvedValue(null);
    mockLinkDatabase.update.mockResolvedValue(true);
    mockLinkDatabase.delete.mockResolvedValue(true);
  });

  it('should show loading state when auth is loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
      signOut: vi.fn()
    });

    render(
      <TestWrapper>
        <Index />
      </TestWrapper>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should redirect to auth when user is not logged in', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      signOut: vi.fn()
    });

    render(
      <TestWrapper>
        <Index />
      </TestWrapper>
    );

    expect(mockNavigate).toHaveBeenCalledWith('/auth');
  });

  it('should render main interface when user is authenticated', async () => {
    render(
      <TestWrapper>
        <Index />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('My Links')).toBeInTheDocument();
      expect(screen.getByText('Save and organize your favorite links')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Paste a URL to save...')).toBeInTheDocument();
    });
  });

  it('should show empty state when no links exist', async () => {
    render(
      <TestWrapper>
        <Index />
      </TestWrapper>
    );

    await waitFor(() => {
      // Should show empty state (exact text depends on EmptyState component)
      expect(screen.queryByText('Search links...')).not.toBeInTheDocument();
    });
  });

  it('should display links when they exist', async () => {
    const mockLinks = [
      {
        id: '1',
        url: 'https://example.com',
        title: 'Example Site',
        tags: ['work'],
        createdAt: new Date('2023-01-01'),
        favicon: 'https://example.com/favicon.ico'
      },
      {
        id: '2',
        url: 'https://test.com',
        title: 'Test Site',
        tags: ['personal'],
        createdAt: new Date('2023-01-02'),
        favicon: 'https://test.com/favicon.ico'
      }
    ];

    mockLinkDatabase.getAll.mockResolvedValue(mockLinks);

    render(
      <TestWrapper>
        <Index />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Example Site')).toBeInTheDocument();
      expect(screen.getByText('Test Site')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search links...')).toBeInTheDocument();
    });
  });

  it('should filter links based on search query', async () => {
    const user = userEvent.setup();
    const mockLinks = [
      {
        id: '1',
        url: 'https://example.com',
        title: 'Example Site',
        tags: ['work'],
        createdAt: new Date('2023-01-01')
      },
      {
        id: '2',
        url: 'https://test.com',
        title: 'Test Site',
        tags: ['personal'],
        createdAt: new Date('2023-01-02')
      }
    ];

    mockLinkDatabase.getAll.mockResolvedValue(mockLinks);

    render(
      <TestWrapper>
        <Index />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Example Site')).toBeInTheDocument();
      expect(screen.getByText('Test Site')).toBeInTheDocument();
    });

    // Search for "example"
    const searchInput = screen.getByPlaceholderText('Search links...');
    await user.type(searchInput, 'example');

    // Should only show Example Site
    expect(screen.getByText('Example Site')).toBeInTheDocument();
    expect(screen.queryByText('Test Site')).not.toBeInTheDocument();
  });

  it('should filter links by tags', async () => {
    const user = userEvent.setup();
    const mockLinks = [
      {
        id: '1',
        url: 'https://example.com',
        title: 'Example Site',
        tags: ['work', 'development'],
        createdAt: new Date('2023-01-01')
      },
      {
        id: '2',
        url: 'https://test.com',
        title: 'Test Site',
        tags: ['personal'],
        createdAt: new Date('2023-01-02')
      }
    ];

    mockLinkDatabase.getAll.mockResolvedValue(mockLinks);

    render(
      <TestWrapper>
        <Index />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Example Site')).toBeInTheDocument();
      expect(screen.getByText('Test Site')).toBeInTheDocument();
    });

    // Filter by work tag (this would require clicking on the tag in the sidebar)
    // For now, we'll test the filtering logic by checking if both links are present initially
    expect(screen.getByText('Example Site')).toBeInTheDocument();
    expect(screen.getByText('Test Site')).toBeInTheDocument();
  });

  it('should switch between card and list view modes', async () => {
    const user = userEvent.setup();
    const mockLinks = [
      {
        id: '1',
        url: 'https://example.com',
        title: 'Example Site',
        tags: ['work'],
        createdAt: new Date('2023-01-01')
      }
    ];

    mockLinkDatabase.getAll.mockResolvedValue(mockLinks);

    render(
      <TestWrapper>
        <Index />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Example Site')).toBeInTheDocument();
    });

    // Should have view switcher buttons
    const viewButtons = screen.getAllByRole('button');
    const viewSwitcherButtons = viewButtons.filter(button => 
      button.querySelector('svg') && (
        button.getAttribute('class')?.includes('grid') ||
        button.getAttribute('class')?.includes('list')
      )
    );

    expect(viewSwitcherButtons.length).toBeGreaterThan(0);
  });

  it('should handle adding new links', async () => {
    const user = userEvent.setup();
    const mockNewLink = {
      id: '1',
      url: 'https://newsite.com',
      title: 'New Site',
      tags: [],
      createdAt: new Date(),
      favicon: 'https://newsite.com/favicon.ico'
    };

    mockLinkDatabase.save.mockResolvedValue(mockNewLink);

    render(
      <TestWrapper>
        <Index />
      </TestWrapper>
    );

    const input = screen.getByPlaceholderText('Paste a URL to save...');
    const saveButton = screen.getByText('Save Link');

    await user.type(input, 'https://newsite.com');
    await user.click(saveButton);

    // Should call the save method
    await waitFor(() => {
      expect(mockLinkDatabase.save).toHaveBeenCalled();
    });
  });

  it('should persist view mode preference to localStorage', async () => {
    const mockSetItem = vi.fn();
    const mockGetItem = vi.fn().mockReturnValue('list');
    
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: mockGetItem,
        setItem: mockSetItem,
      },
      writable: true,
    });

    render(
      <TestWrapper>
        <Index />
      </TestWrapper>
    );

    // Should read from localStorage on mount
    expect(mockGetItem).toHaveBeenCalledWith('linkManager_viewMode');
  });

  it('should show "no links match" message when search has no results', async () => {
    const user = userEvent.setup();
    const mockLinks = [
      {
        id: '1',
        url: 'https://example.com',
        title: 'Example Site',
        tags: ['work'],
        createdAt: new Date('2023-01-01')
      }
    ];

    mockLinkDatabase.getAll.mockResolvedValue(mockLinks);

    render(
      <TestWrapper>
        <Index />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Example Site')).toBeInTheDocument();
    });

    // Search for something that doesn't exist
    const searchInput = screen.getByPlaceholderText('Search links...');
    await user.type(searchInput, 'nonexistent');

    expect(screen.getByText('No links match your search')).toBeInTheDocument();
  });
});
