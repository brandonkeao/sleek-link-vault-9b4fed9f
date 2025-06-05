
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Index from './Index';
import * as useAuthModule from '../hooks/useAuth';
import * as linkDatabase from '../utils/linkDatabase';
import { TestWrapper, createMockAuthContext, setupCommonMocks } from '../test-utils/mockHelpers';

// Mock all the dependencies
vi.mock('../hooks/useAuth');
vi.mock('../utils/linkDatabase');

describe('Index Page - Authentication', () => {
  const mockUseAuth = vi.mocked(useAuthModule.useAuth);
  const mockLinkDatabase = vi.mocked(linkDatabase.linkDatabase);
  let mockNavigate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    ({ mockNavigate } = setupCommonMocks());
    
    // Default auth state
    mockUseAuth.mockReturnValue(createMockAuthContext());

    // Default empty links
    mockLinkDatabase.getAll.mockResolvedValue([]);
    mockLinkDatabase.save.mockResolvedValue(null);
    mockLinkDatabase.update.mockResolvedValue(true);
    mockLinkDatabase.delete.mockResolvedValue(true);
  });

  it('should show loading state when auth is loading', () => {
    mockUseAuth.mockReturnValue(createMockAuthContext({
      user: null,
      loading: true
    }));

    render(
      <TestWrapper>
        <Index />
      </TestWrapper>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should redirect to auth when user is not logged in', () => {
    mockUseAuth.mockReturnValue(createMockAuthContext({
      user: null,
      loading: false
    }));

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

    expect(screen.getByText('My Links')).toBeInTheDocument();
    expect(screen.getByText('Save and organize your favorite links')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Paste a URL to save...')).toBeInTheDocument();
  });
});
