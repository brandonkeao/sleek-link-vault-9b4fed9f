
import { describe, it, expect } from 'vitest';
import { getTimeAgo } from './timeUtils';

describe('timeUtils', () => {
  describe('getTimeAgo', () => {
    it('should return "just now" for very recent dates', () => {
      const now = new Date();
      const result = getTimeAgo(now);
      expect(result).toBe('just now');
    });

    it('should return minutes ago for dates within an hour', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const result = getTimeAgo(fiveMinutesAgo);
      expect(result).toBe('5 minutes ago');
    });

    it('should return singular minute for 1 minute ago', () => {
      const oneMinuteAgo = new Date(Date.now() - 1 * 60 * 1000);
      const result = getTimeAgo(oneMinuteAgo);
      expect(result).toBe('1 minute ago');
    });

    it('should return hours ago for dates within a day', () => {
      const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
      const result = getTimeAgo(threeHoursAgo);
      expect(result).toBe('3 hours ago');
    });

    it('should return singular hour for 1 hour ago', () => {
      const oneHourAgo = new Date(Date.now() - 1 * 60 * 60 * 1000);
      const result = getTimeAgo(oneHourAgo);
      expect(result).toBe('1 hour ago');
    });

    it('should return days ago for dates within a week', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      const result = getTimeAgo(threeDaysAgo);
      expect(result).toBe('3 days ago');
    });

    it('should return weeks ago for dates within a month', () => {
      const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
      const result = getTimeAgo(twoWeeksAgo);
      expect(result).toBe('2 weeks ago');
    });

    it('should return formatted date for older dates', () => {
      const twoMonthsAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
      const result = getTimeAgo(twoMonthsAgo);
      expect(result).toBe(twoMonthsAgo.toLocaleDateString());
    });
  });
});
