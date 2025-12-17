import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';
import { axe } from 'jest-axe';
import { SkipToContent } from '@/components/SkipToContent';
import userEvent from '@testing-library/user-event';

describe('SkipToContent - Accessibility', () => {
  it('should not have any accessibility violations', async () => {
    const { container } = render(<SkipToContent />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper href attribute', () => {
    render(<SkipToContent />);
    
    const skipLink = screen.getByRole('link', { name: /skip to main content/i });
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  it('should be hidden visually but accessible to screen readers', () => {
    render(<SkipToContent />);
    
    const skipLink = screen.getByRole('link', { name: /skip to main content/i });
    expect(skipLink).toHaveClass('sr-only');
  });

  it('should become visible when focused', () => {
    render(<SkipToContent />);
    
    const skipLink = screen.getByRole('link', { name: /skip to main content/i });
    // Check for focus class that makes it visible
    expect(skipLink).toHaveClass('focus:not-sr-only');
  });

  it('should have proper positioning when focused', () => {
    render(<SkipToContent />);
    
    const skipLink = screen.getByRole('link', { name: /skip to main content/i });
    
    // Should have fixed positioning classes when focused
    expect(skipLink.className).toContain('focus:fixed');
    expect(skipLink.className).toContain('focus:top-0');
    expect(skipLink.className).toContain('focus:left-0');
  });

  it('should have high z-index when focused to appear above other content', () => {
    render(<SkipToContent />);
    
    const skipLink = screen.getByRole('link', { name: /skip to main content/i });
    expect(skipLink.className).toContain('focus:z-50');
  });

  it('should have clear visual styling when focused', () => {
    render(<SkipToContent />);
    
    const skipLink = screen.getByRole('link', { name: /skip to main content/i });
    
    // Should have background and text color
    expect(skipLink.className).toContain('focus:bg-primary');
    expect(skipLink.className).toContain('focus:text-primary-foreground');
  });

  it('should have padding when focused for better readability', () => {
    render(<SkipToContent />);
    
    const skipLink = screen.getByRole('link', { name: /skip to main content/i });
    
    // Should have padding classes
    expect(skipLink.className).toContain('focus:px-4');
    expect(skipLink.className).toContain('focus:py-2');
  });

  it('should handle click event and focus main content', async () => {
    const user = userEvent.setup();
    
    // Create a mock main element
    const main = document.createElement('main');
    main.tabIndex = -1;
    
    // Mock focus and scrollIntoView using Object.defineProperty
    const focusSpy = vi.fn();
    const scrollSpy = vi.fn();
    
    Object.defineProperty(main, 'focus', {
      value: focusSpy,
      writable: true,
    });
    
    Object.defineProperty(main, 'scrollIntoView', {
      value: scrollSpy,
      writable: true,
    });
    
    document.body.appendChild(main);
    
    render(<SkipToContent />);
    
    const skipLink = screen.getByRole('link', { name: /skip to main content/i });
    await user.click(skipLink);
    
    expect(focusSpy).toHaveBeenCalled();
    expect(scrollSpy).toHaveBeenCalledWith({ behavior: 'smooth' });
    
    // Cleanup
    document.body.removeChild(main);
  });

  it('should be keyboard accessible', async () => {
    const user = userEvent.setup();
    
    render(
      <div>
        <SkipToContent />
        <button>Some button</button>
      </div>
    );
    
    // Tab to the skip link (it should be first in tab order)
    await user.tab();
    
    const skipLink = screen.getByRole('link', { name: /skip to main content/i });
    expect(skipLink).toHaveFocus();
  });

  it('should have descriptive link text', () => {
    render(<SkipToContent />);
    
    const skipLink = screen.getByRole('link', { name: /skip to main content/i });
    expect(skipLink.textContent).toBe('Skip to main content');
  });
});
