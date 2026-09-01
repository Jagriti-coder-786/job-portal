import { describe, it, expect } from 'vitest';

// Let's create simple formatter utilities for the test
const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;
  
  return date.toLocaleDateString();
};

const formatSalary = (salary) => {
  if (!salary || (!salary.min && !salary.max)) return 'Not specified';
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: salary.currency || 'USD',
    maximumFractionDigits: 0
  });

  if (salary.min && salary.max) {
    return `${formatter.format(salary.min)} - ${formatter.format(salary.max)}`;
  }
  if (salary.min) return `From ${formatter.format(salary.min)}`;
  return `Up to ${formatter.format(salary.max)}`;
};

describe('Formatter Utilities', () => {
  describe('formatRelativeTime', () => {
    it('should format just now', () => {
      const now = new Date();
      expect(formatRelativeTime(now.toISOString())).toBe('Just now');
    });

    it('should format minutes ago', () => {
      const date = new Date(Date.now() - 5 * 60 * 1000);
      expect(formatRelativeTime(date.toISOString())).toBe('5m ago');
    });
  });

  describe('formatSalary', () => {
    it('should format salary range', () => {
      expect(formatSalary({ min: 50000, max: 80000, currency: 'USD' }))
        .toBe('$50,000 - $80,000');
    });

    it('should format min salary only', () => {
      expect(formatSalary({ min: 60000, currency: 'EUR' }))
        .toBe('From €60,000');
    });
  });
});
