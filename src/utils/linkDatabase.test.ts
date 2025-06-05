
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { linkDatabase } from './linkDatabase';
import { supabase } from '../integrations/supabase/client';
import { Link } from '../types/Link';

// Mock Supabase
vi.mock('../integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn()
    }
  }
}));

describe('linkDatabase', () => {
  const mockSupabaseFrom = vi.fn();
  const mockSelect = vi.fn();
  const mockInsert = vi.fn();
  const mockUpdate = vi.fn();
  const mockDelete = vi.fn();
  const mockOrder = vi.fn();
  const mockEq = vi.fn();
  const mockSingle = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    (supabase.from as any).mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete
    });
    
    mockSelect.mockReturnValue({
      order: mockOrder
    });
    
    mockOrder.mockReturnValue({
      data: [],
      error: null
    });
    
    mockInsert.mockReturnValue({
      select: () => ({
        single: mockSingle
      })
    });
    
    mockUpdate.mockReturnValue({
      eq: mockEq
    });
    
    mockDelete.mockReturnValue({
      eq: mockEq
    });
    
    mockEq.mockReturnValue({
      data: null,
      error: null
    });
    
    mockSingle.mockReturnValue({
      data: null,
      error: null
    });
  });

  describe('getAll', () => {
    it('should fetch and transform links correctly', async () => {
      const mockData = [
        {
          id: '1',
          url: 'https://example.com',
          title: 'Example',
          tags: ['tag1', 'tag2'],
          created_at: '2023-01-01T00:00:00Z',
          favicon: 'https://example.com/favicon.ico',
          short_url: 'https://short.ly/abc',
          rebrandly_id: 'rebrandly123',
          shortening_status: 'shortened',
          user_id: 'user123'
        }
      ];
      
      mockOrder.mockReturnValue({
        data: mockData,
        error: null
      });

      const result = await linkDatabase.getAll();
      
      expect(supabase.from).toHaveBeenCalledWith('links');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: '1',
        url: 'https://example.com',
        title: 'Example',
        tags: ['tag1', 'tag2'],
        createdAt: new Date('2023-01-01T00:00:00Z'),
        favicon: 'https://example.com/favicon.ico',
        shortUrl: 'https://short.ly/abc',
        rebrandlyId: 'rebrandly123',
        shorteningStatus: 'shortened',
        userId: 'user123'
      });
    });

    it('should handle null tags array', async () => {
      const mockData = [
        {
          id: '1',
          url: 'https://example.com',
          title: 'Example',
          tags: null,
          created_at: '2023-01-01T00:00:00Z'
        }
      ];
      
      mockOrder.mockReturnValue({
        data: mockData,
        error: null
      });

      const result = await linkDatabase.getAll();
      
      expect(result[0].tags).toEqual([]);
    });

    it('should return empty array on error', async () => {
      mockOrder.mockReturnValue({
        data: null,
        error: { message: 'Database error' }
      });

      const result = await linkDatabase.getAll();
      
      expect(result).toEqual([]);
    });
  });

  describe('save', () => {
    it('should save link when user is authenticated', async () => {
      const mockUser = { id: 'user123' };
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockUser }
      });

      const mockSavedData = {
        id: '1',
        url: 'https://example.com',
        title: 'Example',
        tags: ['tag1'],
        created_at: '2023-01-01T00:00:00Z',
        favicon: 'https://example.com/favicon.ico',
        short_url: null,
        rebrandly_id: null,
        shortening_status: null,
        user_id: 'user123'
      };

      mockSingle.mockReturnValue({
        data: mockSavedData,
        error: null
      });

      const linkToSave = {
        url: 'https://example.com',
        title: 'Example',
        tags: ['tag1'],
        favicon: 'https://example.com/favicon.ico'
      };

      const result = await linkDatabase.save(linkToSave);

      expect(supabase.auth.getUser).toHaveBeenCalled();
      expect(mockInsert).toHaveBeenCalledWith([{
        url: 'https://example.com',
        title: 'Example',
        tags: ['tag1'],
        favicon: 'https://example.com/favicon.ico',
        short_url: undefined,
        rebrandly_id: undefined,
        shortening_status: undefined,
        user_id: 'user123'
      }]);

      expect(result).toEqual({
        id: '1',
        url: 'https://example.com',
        title: 'Example',
        tags: ['tag1'],
        createdAt: new Date('2023-01-01T00:00:00Z'),
        favicon: 'https://example.com/favicon.ico',
        shortUrl: null,
        rebrandlyId: null,
        shorteningStatus: null,
        userId: 'user123'
      });
    });

    it('should return null when user is not authenticated', async () => {
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: null }
      });

      const linkToSave = {
        url: 'https://example.com',
        title: 'Example',
        tags: [],
        favicon: undefined
      };

      const result = await linkDatabase.save(linkToSave);

      expect(result).toBeNull();
    });

    it('should return null on save error', async () => {
      const mockUser = { id: 'user123' };
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockUser }
      });

      mockSingle.mockReturnValue({
        data: null,
        error: { message: 'Save error' }
      });

      const linkToSave = {
        url: 'https://example.com',
        title: 'Example',
        tags: [],
        favicon: undefined
      };

      const result = await linkDatabase.save(linkToSave);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update link successfully', async () => {
      mockEq.mockReturnValue({
        data: null,
        error: null
      });

      const linkToUpdate: Link = {
        id: '1',
        url: 'https://example.com',
        title: 'Updated Example',
        tags: ['updated'],
        createdAt: new Date(),
        favicon: 'https://example.com/favicon.ico',
        shortUrl: 'https://short.ly/abc',
        rebrandlyId: 'rebrandly123',
        shorteningStatus: 'shortened',
        userId: 'user123'
      };

      const result = await linkDatabase.update(linkToUpdate);

      expect(mockUpdate).toHaveBeenCalledWith({
        url: 'https://example.com',
        title: 'Updated Example',
        tags: ['updated'],
        favicon: 'https://example.com/favicon.ico',
        short_url: 'https://short.ly/abc',
        rebrandly_id: 'rebrandly123',
        shortening_status: 'shortened',
        updated_at: expect.any(String)
      });
      expect(mockEq).toHaveBeenCalledWith('id', '1');
      expect(result).toBe(true);
    });

    it('should return false on update error', async () => {
      mockEq.mockReturnValue({
        data: null,
        error: { message: 'Update error' }
      });

      const linkToUpdate: Link = {
        id: '1',
        url: 'https://example.com',
        title: 'Example',
        tags: [],
        createdAt: new Date()
      };

      const result = await linkDatabase.update(linkToUpdate);

      expect(result).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete link successfully', async () => {
      mockEq.mockReturnValue({
        data: null,
        error: null
      });

      const result = await linkDatabase.delete('1');

      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('id', '1');
      expect(result).toBe(true);
    });

    it('should return false on delete error', async () => {
      mockEq.mockReturnValue({
        data: null,
        error: { message: 'Delete error' }
      });

      const result = await linkDatabase.delete('1');

      expect(result).toBe(false);
    });
  });
});
