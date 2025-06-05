
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Index from './Index';
import * as useAuthModule from '../hooks/useAuth';
import * * linkDatabase from '../utils/linkDatabase';
import { TestWrapper, createMockAuthContext, setupCommonMocks } from '../test-utils/mockHelpers';

// Mock all the dependencies
vi.mock('../hooks/useAuth');
vi.mock('../utils/linkDatabase');

describe('Index Page - UI Interactions', () => {
  const mockUseAuth = vi.mocked(useAuthModule.useAuth);
  const mockLinkDatabase = vi.mocked(linkDatabase.linkDatabase);

  beforeEach(() => {
    vi.clearAllMocks();
    setupCommonMocks();
    
    // Default auth state
    mockUseAuth.mockReturnValue(createMockAuthContext());

    // Default empty links
    mockLinkDatabase.getAll.mockResolvedValue([]);
    mockLinkDatabase.save.mockResolvedValue(null);
    mockLinkDatabase.update.mockResolvedValue(true);
    mockLinkDatabase.delete.mockResolvedValue(true);
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

  it('should switch between card and list view modes', async () => {
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

  it('should persist view mode preference to localStorage', () => {
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
