
import { vi } from 'vitest';
import { User } from '@supabase/supabase-js';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';

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

export const createMockAuthContext = (overrides = {}) => ({
  user: createMockUser(),
  session: null,
  loading: false,
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  ...overrides
});

export const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

export const setupCommonMocks = () => {
  const mockNavigate = vi.fn();

  vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
      ...actual,
      useNavigate: () => mockNavigate
    };
  });

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

  return { mockNavigate };
};
