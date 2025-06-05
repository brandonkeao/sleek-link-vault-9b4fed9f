
import { vi } from 'vitest';
import { User } from '@supabase/supabase-js';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';

// Create a proper mock User object with all required properties
export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: 'user123',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2023-01-01T00:00:00Z',
  phone: '',
  confirmed_at: '2023-01-01T00:00:00Z',
  email_confirmed_at: '2023-01-01T00:00:00Z',
  last_sign_in_at: '2023-01-01T00:00:00Z',
  role: 'authenticated',
  updated_at: '2023-01-01T00:00:00Z',
  ...overrides
});

// Default auth context mock
export const createMockAuthContext = (overrides = {}) => ({
  user: createMockUser(),
  session: null,
  loading: false,
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  ...overrides
});

// Test wrapper component
export const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

// Common mock setup for all tests
export const setupCommonMocks = () => {
  // Mock react-router-dom
  const mockNavigate = vi.fn();
  vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
      ...actual,
      useNavigate: () => mockNavigate
    };
  });

  // Mock integrations
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

  // Mock toast hook
  vi.mock('../hooks/use-toast', () => ({
    useToast: () => ({
      toast: vi.fn()
    })
  }));

  return { mockNavigate };
};
