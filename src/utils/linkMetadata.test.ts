
import { describe, it, expect } from 'vitest';
import { fetchLinkMetadata } from './linkMetadata';

describe('linkMetadata', () => {
  describe('fetchLinkMetadata', () => {
    it('should extract domain from simple URL', async () => {
      const result = await fetchLinkMetadata('https://example.com');
      expect(result.title).toBe('example.com');
      expect(result.favicon).toBe('https://www.google.com/s2/favicons?domain=example.com&sz=32');
    });

    it('should extract title from URL with path', async () => {
      const result = await fetchLinkMetadata('https://example.com/my-article');
      expect(result.title).toBe('My Article');
      expect(result.favicon).toBe('https://www.google.com/s2/favicons?domain=example.com&sz=32');
    });

    it('should handle URLs with multiple path segments', async () => {
      const result = await fetchLinkMetadata('https://blog.example.com/category/my-blog-post');
      expect(result.title).toBe('My Blog Post');
      expect(result.favicon).toBe('https://www.google.com/s2/favicons?domain=blog.example.com&sz=32');
    });

    it('should remove file extensions from titles', async () => {
      const result = await fetchLinkMetadata('https://example.com/document.html');
      expect(result.title).toBe('Document');
    });

    it('should handle invalid URLs gracefully', async () => {
      const result = await fetchLinkMetadata('not-a-url');
      expect(result.title).toBe('not-a-url');
      expect(result.favicon).toBeUndefined();
    });

    it('should remove www from domain', async () => {
      const result = await fetchLinkMetadata('https://www.example.com');
      expect(result.favicon).toBe('https://www.google.com/s2/favicons?domain=example.com&sz=32');
    });
  });
});
