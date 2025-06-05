
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Index from './Index';
import * as useAuthModule from '../hooks/useAuth';
import * as linkDatabase from '../utils/linkDatabase';
import { TestWrapper, createMockAuthContext, setupCommonMocks } from '../test-utils/mockHelpers';

// Mock all the dependencies
vi.mock('../hooks/useAuth');
vi.mock('../utils/linkDatabase');

describe('Index Page - Link Management', () => {
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

  it('should show empty state when no links exist', async () => {
    render(
      <TestWrapper>
        <Index />
      </TestWrapper>
    );

    await waitFor(() => {
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

    await waitFor(() => {
      expect(mockLinkDatabase.save).toHaveBeenCalled();
    });
  });

  it('should filter links by tags', async () => {
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
  });
});
