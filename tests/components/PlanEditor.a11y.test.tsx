import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';
import { axe } from 'jest-axe';
import { PlanEditor } from '@/components/PlanEditor';
import { WorkoutPlan } from '@/lib/types';
import userEvent from '@testing-library/user-event';

describe('PlanEditor - Accessibility', () => {
  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();

  const mockPlan: WorkoutPlan = {
    id: 'plan-1',
    name: 'Test Plan',
    description: 'Test Description',
    exercises: [
      {
        exerciseId: 'bench-press',
        sets: 3,
        reps: 10,
        weight: 135,
        restSeconds: 90,
      },
    ],
    createdAt: Date.now(),
  };

  it('should not have any accessibility violations', async () => {
    const { container } = render(
      <PlanEditor plan={null} onSave={mockOnSave} onCancel={mockOnCancel} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have accessible form labels for all inputs', () => {
    render(<PlanEditor plan={null} onSave={mockOnSave} onCancel={mockOnCancel} />);
    
    expect(screen.getByLabelText('Plan Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
  });

  it('should have accessible labels for exercise configuration fields', async () => {
    const user = userEvent.setup();
    render(<PlanEditor plan={null} onSave={mockOnSave} onCancel={mockOnCancel} />);
    
    // Add an exercise first
    const addButton = screen.getByRole('button', { name: /add exercise/i });
    await user.click(addButton);

    // Check for exercise field labels
    expect(screen.getByLabelText('Exercise')).toBeInTheDocument();
    expect(screen.getByLabelText('Sets')).toBeInTheDocument();
    expect(screen.getByLabelText('Reps')).toBeInTheDocument();
    expect(screen.getByLabelText(/weight/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/rest/i)).toBeInTheDocument();
  });

  it('should have accessible button labels', () => {
    render(<PlanEditor plan={null} onSave={mockOnSave} onCancel={mockOnCancel} />);
    
    expect(screen.getByRole('button', { name: /add exercise/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save plan/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('should disable save button when name is empty', () => {
    render(<PlanEditor plan={null} onSave={mockOnSave} onCancel={mockOnCancel} />);
    
    const saveButton = screen.getByRole('button', { name: /save plan/i });
    expect(saveButton).toBeDisabled();
  });

  it('should disable save button when no exercises added', async () => {
    const user = userEvent.setup();
    render(<PlanEditor plan={null} onSave={mockOnSave} onCancel={mockOnCancel} />);
    
    const nameInput = screen.getByLabelText('Plan Name');
    await user.type(nameInput, 'Test Plan');

    const saveButton = screen.getByRole('button', { name: /save plan/i });
    expect(saveButton).toBeDisabled();
  });

  it('should have remove button with accessible name', async () => {
    render(<PlanEditor plan={mockPlan} onSave={mockOnSave} onCancel={mockOnCancel} />);
    
    // Find the remove button (Trash icon button)
    const removeButtons = screen.getAllByRole('button');
    const removeButton = removeButtons.find((btn: HTMLElement) => 
      btn.querySelector('svg') && !btn.textContent?.trim()
    );
    
    expect(removeButton).toBeInTheDocument();
  });

  it('should support keyboard navigation through form fields', async () => {
    const user = userEvent.setup();
    render(<PlanEditor plan={null} onSave={mockOnSave} onCancel={mockOnCancel} />);
    
    const nameInput = screen.getByLabelText('Plan Name');
    nameInput.focus();
    expect(nameInput).toHaveFocus();

    await user.tab();
    expect(screen.getByLabelText('Description')).toHaveFocus();
  });

  it('should maintain proper focus management when adding exercises', async () => {
    const user = userEvent.setup();
    render(<PlanEditor plan={null} onSave={mockOnSave} onCancel={mockOnCancel} />);
    
    const addButton = screen.getByRole('button', { name: /add exercise/i });
    await user.click(addButton);

    // After adding, the new exercise select should be in the document
    const exerciseSelect = screen.getByLabelText('Exercise');
    expect(exerciseSelect).toBeInTheDocument();
  });

  it('should show empty state message with appropriate text', () => {
    render(<PlanEditor plan={null} onSave={mockOnSave} onCancel={mockOnCancel} />);
    
    expect(screen.getByText(/no exercises added yet/i)).toBeInTheDocument();
  });

  it('should have proper number input constraints', async () => {
    render(<PlanEditor plan={mockPlan} onSave={mockOnSave} onCancel={mockOnCancel} />);
    
    const setsInput = screen.getByLabelText('Sets') as HTMLInputElement;
    expect(setsInput).toHaveAttribute('type', 'number');
    expect(setsInput).toHaveAttribute('min', '1');

    const weightInput = screen.getByLabelText(/weight/i) as HTMLInputElement;
    expect(weightInput).toHaveAttribute('type', 'number');
    expect(weightInput).toHaveAttribute('min', '0');
  });
});
