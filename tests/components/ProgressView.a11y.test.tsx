import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '../test-utils';
import { axe } from 'jest-axe';
import { ProgressView } from '@/components/ProgressView';
import type { WorkoutSession } from '@/lib/types';

describe('ProgressView - Accessibility', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const mockSession: WorkoutSession = {
    id: 'session-1',
    planId: 'plan-1',
    planName: 'Push Day',
    startedAt: Date.now() - 3600000, // 1 hour ago
    completedAt: Date.now(),
    exercises: [
      {
        exerciseId: 'bench-press',
        exerciseName: 'Bench Press',
        completedSets: [
          { setNumber: 1, reps: 10, weight: 135, completedAt: Date.now() },
          { setNumber: 2, reps: 10, weight: 135, completedAt: Date.now() },
          { setNumber: 3, reps: 8, weight: 135, completedAt: Date.now() },
        ],
      },
      {
        exerciseId: 'shoulder-press',
        exerciseName: 'Shoulder Press',
        completedSets: [
          { setNumber: 1, reps: 12, weight: 50, completedAt: Date.now() },
          { setNumber: 2, reps: 12, weight: 50, completedAt: Date.now() },
        ],
      },
    ],
    status: 'completed',
  };

  it('should not have any accessibility violations with workout history', async () => {
    localStorage.setItem('workout-sessions', JSON.stringify([mockSession]));
    
    const { container } = render(<ProgressView />);
    
    // Wait for data to load
    await screen.findByText(mockSession.planName);
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should not have any accessibility violations with empty state', async () => {
    const { container } = render(<ProgressView />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper heading hierarchy', () => {
    render(<ProgressView />);
    
    const h1 = screen.getByRole('heading', { level: 1, name: /progress/i });
    expect(h1).toBeInTheDocument();
    
    const h2 = screen.getByRole('heading', { level: 2, name: /workout history/i });
    expect(h2).toBeInTheDocument();
  });

  it('should have proper heading hierarchy in session cards', async () => {
    localStorage.setItem('workout-sessions', JSON.stringify([mockSession]));
    
    render(<ProgressView />);
    
    const h3 = await screen.findByRole('heading', { level: 3, name: mockSession.planName });
    expect(h3).toBeInTheDocument();
  });

  it('should have accessible stat cards with descriptive text', async () => {
    localStorage.setItem('workout-sessions', JSON.stringify([mockSession]));
    
    render(<ProgressView />);
    
    // Wait for session data to load
    await screen.findByText(mockSession.planName);
    
    expect(screen.getByText('Total Workouts')).toBeInTheDocument();
    expect(screen.getByText('Total Sets')).toBeInTheDocument();
    expect(screen.getByText('Days Active')).toBeInTheDocument();
  });

  it('should have proper article structure for workout history items', async () => {
    localStorage.setItem('workout-sessions', JSON.stringify([mockSession]));
    
    const { container } = render(<ProgressView />);
    
    // Wait for data to load first
    await screen.findByText(mockSession.planName);
    
    const articles = container.querySelectorAll('article');
    expect(articles.length).toBeGreaterThan(0);
  });

  it('should show empty state with descriptive heading and text', () => {
    render(<ProgressView />);
    
    expect(screen.getByRole('heading', { name: /no completed workouts yet/i })).toBeInTheDocument();
    expect(screen.getByText(/complete your first workout to see your progress here/i)).toBeInTheDocument();
  });

  it('should have accessible workout history list structure', async () => {
    localStorage.setItem('workout-sessions', JSON.stringify([mockSession]));
    
    render(<ProgressView />);
    
    // Wait for data to load first
    await screen.findByText(mockSession.planName);
    
    // Check that exercises are in a list
    const lists = screen.getAllByRole('list');
    expect(lists.length).toBeGreaterThan(0);
  });

  it('should display exercise information with proper semantic structure', async () => {
    localStorage.setItem('workout-sessions', JSON.stringify([mockSession]));
    
    render(<ProgressView />);
    
    // Wait for data to load first
    await screen.findByText(mockSession.planName);
    
    // Each exercise should be a list item
    const listItems = screen.getAllByRole('listitem');
    expect(listItems.length).toBeGreaterThan(0);
  });

  it('should have decorative icons marked as aria-hidden', () => {
    localStorage.setItem('workout-sessions', JSON.stringify([mockSession]));
    
    const { container } = render(<ProgressView />);
    
    // Icons should be decorative and not exposed to screen readers
    const icons = container.querySelectorAll('svg[aria-hidden="true"]');
    expect(icons.length).toBeGreaterThan(0);
  });

  it('should show duration badge with accessible text', async () => {
    localStorage.setItem('workout-sessions', JSON.stringify([mockSession]));
    
    render(<ProgressView />);
    
    // Wait for data to load first
    await screen.findByText(mockSession.planName);
    
    // Duration should be visible
    expect(screen.getByText(/\d+ min/)).toBeInTheDocument();
  });

  it('should have exercise muscle group badges', async () => {
    localStorage.setItem('workout-sessions', JSON.stringify([mockSession]));
    
    render(<ProgressView />);
    
    // Wait for data to load first
    await screen.findByText(mockSession.planName);
    
    // Muscle group badges should be present
    const badges = screen.getAllByText(/chest|back|shoulders|arms|legs|core/i);
    expect(badges.length).toBeGreaterThan(0);
  });
});
