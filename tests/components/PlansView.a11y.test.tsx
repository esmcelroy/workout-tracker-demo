import { describe, it, expect } from 'vitest';
import { render } from '../test-utils';
import { axe } from 'jest-axe';
import { PlansView } from '@/components/PlansView';

describe('PlansView - Accessibility', () => {
  it('should not have any accessibility violations', async () => {
    const { container } = render(<PlansView />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper heading hierarchy', () => {
    const { getByRole } = render(<PlansView />);
    const heading = getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Workout Plans');
  });

  it('should have aria-label on icon-only buttons', async () => {
    // Store mock plans in localStorage first
    const mockPlan = {
      id: 'plan-1',
      name: 'Test Plan',
      description: 'Test Description',
      exercises: [{ exerciseId: 'bench-press', sets: 3, reps: 10 }],
    };
    localStorage.setItem('workout-plans', JSON.stringify([mockPlan]));
    
    const { findByRole } = render(<PlansView />);
    
    // Wait for the edit button to appear
    const editButton = await findByRole('button', { name: /edit test plan/i });
    expect(editButton).toHaveAttribute('aria-label');
  });

  it('should not have main landmark (PlansView is a content component)', () => {
    const { container } = render(<PlansView />);
    // PlansView is rendered inside App.tsx which has the main element
    // This component itself doesn't need a main landmark
    const main = container.querySelector('main');
    expect(main).not.toBeInTheDocument();
  });
});
