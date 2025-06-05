
import { describe, it, expect } from 'vitest';
import { Link } from './Link';

describe('Link type', () => {
  it('should accept valid link object', () => {
    const validLink: Link = {
      id: '1',
      url: 'https://example.com',
      title: 'Example',
      tags: ['tag1', 'tag2'],
      createdAt: new Date(),
      favicon: 'https://example.com/favicon.ico',
      shortUrl: 'https://short.ly/abc',
      rebrandlyId: 'rebrandly123',
      shorteningStatus: 'shortened',
      userId: 'user123'
    };

    // This test passes if TypeScript compilation succeeds
    expect(validLink.id).toBe('1');
    expect(validLink.url).toBe('https://example.com');
    expect(validLink.title).toBe('Example');
    expect(validLink.tags).toEqual(['tag1', 'tag2']);
    expect(validLink.createdAt).toBeInstanceOf(Date);
  });

  it('should accept minimal link object', () => {
    const minimalLink: Link = {
      id: '2',
      url: 'https://minimal.com',
      title: 'Minimal',
      tags: [],
      createdAt: new Date()
    };

    expect(minimalLink.id).toBe('2');
    expect(minimalLink.favicon).toBeUndefined();
    expect(minimalLink.shortUrl).toBeUndefined();
  });
});
