
// @ts-nocheck

import { vi } from 'vitest';
import { User } from '@supabase/supabase-js';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';

export const createMockUser = (overrides = {}) => {
  return {
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
  };
};

export const createMockAuthContext = (overrides = {}) => {
  return {
    user: createMockUser(),
    session: null,
    loading: false,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    ...overrides
  };
};

export const TestWrapper = ({ children }) => {
  return React.createElement(BrowserRouter, null, children);
};

export const setupCommonMocks = () => {
  const mockNavigate = vi.fn();

  vi.mock('react-router-dom', () => {
    return {
      useNavigate: () => mockNavigate
    };
  });

  vi.mock('../integrations/supabase/client', () => {
    return {
      supabase: {
        channel: vi.fn(() => {
          return {
            on: vi.fn(() => {
              return {
                subscribe: vi.fn()
              };
            })
          };
        }),
        removeChannel: vi.fn()
      }
    };
  });

  vi.mock('../hooks/use-toast', () => {
    return {
      useToast: () => {
        return {
          toast: vi.fn()
        };
      }
    };
  });

  return { mockNavigate };
};
