import { describe, it, expect } from 'vitest';
import { render } from '../test-utils';
import { axe } from 'jest-axe';
import { LibraryView } from '@/components/LibraryView';

describe('LibraryView - Accessibility', () => {
  it('should not have any accessibility violations', async () => {
    const { container } = render(<LibraryView />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper heading hierarchy', () => {
    const { getByRole } = render(<LibraryView />);
    const heading = getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Exercise Library');
  });

  it('should have accessible search input with label', () => {
    const { getByLabelText } = render(<LibraryView />);
    const searchInput = getByLabelText('Search exercises');
    expect(searchInput).toBeInTheDocument();
  });

  it('should have aria-live region for exercise count', () => {
    const { container } = render(<LibraryView />);
    const liveRegion = container.querySelector('[role="status"][aria-live="polite"]');
    expect(liveRegion).toBeInTheDocument();
  });
});
