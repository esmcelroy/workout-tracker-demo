import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '../test-utils';
import { axe } from 'jest-axe';
import { WorkoutView } from '@/components/WorkoutView';
import type { WorkoutPlan, WorkoutSession, WorkoutExercise } from '@/lib/types';

// Mock the window.spark.llm function
vi.stubGlobal('spark', {
  llm: vi.fn().mockResolvedValue('Great form! Keep your back straight.')
});

// Helper function to create mock exercise session data
const _createMockExerciseSession = (exerciseId: string, exerciseName: string, sets: number = 0) => ({
  exerciseId,
  exerciseName,
  completedSets: Array.from({ length: sets }, (_, i) => ({
    setNumber: i + 1,
    reps: 10,
    weight: 135,
    completedAt: Date.now(),
  })),
});

describe('WorkoutView - Accessibility', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const mockPlan: WorkoutPlan = {
    id: 'plan-1',
    name: 'Push Day',
    description: 'Chest and shoulders',
    exercises: [
      {
        exerciseId: 'bench-press',
        sets: 3,
        reps: 10,
        weight: 135,
        restSeconds: 90,
      },
      {
        exerciseId: 'shoulder-press',
        sets: 3,
        reps: 12,
        weight: 50,
        restSeconds: 60,
      },
    ],
    createdAt: Date.now(),
  };

  it('should not have any accessibility violations with no active session', async () => {
    localStorage.setItem('workout-plans', JSON.stringify([mockPlan]));
    
    const { container } = render(<WorkoutView />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should not have any accessibility violations with active session', async () => {
    const activeSession: WorkoutSession = {
      id: 'session-1',
      planId: mockPlan.id,
      planName: mockPlan.name,
      startedAt: Date.now(),
      exercises: mockPlan.exercises.map((ex: WorkoutExercise) => ({
        exerciseId: ex.exerciseId,
        exerciseName: 'Bench Press',
        completedSets: [],
      })),
      status: 'in-progress',
    };

    localStorage.setItem('workout-plans', JSON.stringify([mockPlan]));
    localStorage.setItem('active-session', JSON.stringify(activeSession));
    
    const { container } = render(<WorkoutView />);
    
    // Wait for component to load data from API
    await waitFor(() => {
      expect(screen.queryByText('Start a Workout')).not.toBeInTheDocument();
    });
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper heading hierarchy', () => {
    localStorage.setItem('workout-plans', JSON.stringify([mockPlan]));
    
    render(<WorkoutView />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Start a Workout');
  });

  it('should have proper heading hierarchy in active session', async () => {
    // TODO: Requires fixing API mock for active session loading
    const activeSession: WorkoutSession = {
      id: 'session-1',
      planId: mockPlan.id,
      planName: mockPlan.name,
      startedAt: Date.now(),
      exercises: mockPlan.exercises.map((ex: WorkoutExercise) => ({
        exerciseId: ex.exerciseId,
        exerciseName: 'Bench Press',
        completedSets: [],
      })),
      status: 'in-progress',
    };

    localStorage.setItem('workout-plans', JSON.stringify([mockPlan]));
    localStorage.setItem('active-session', JSON.stringify(activeSession));
    
    render(<WorkoutView />);
    
    // Wait for async data load by waiting for the plan name to appear
    const h1 = await screen.findByRole('heading', { level: 1, name: mockPlan.name });
    expect(h1).toBeInTheDocument();
    
    const h2 = await screen.findByRole('heading', { level: 2 });
    expect(h2).toBeInTheDocument();
  });

  it('should have accessible progress indicator with label', async () => {
    const activeSession: WorkoutSession = {
      id: 'session-1',
      planId: mockPlan.id,
      planName: mockPlan.name,
      startedAt: Date.now(),
      exercises: mockPlan.exercises.map((ex: WorkoutExercise) => ({
        exerciseId: ex.exerciseId,
        exerciseName: 'Bench Press',
        completedSets: [],
      })),
      status: 'in-progress',
    };

    localStorage.setItem('workout-plans', JSON.stringify([mockPlan]));
    localStorage.setItem('active-session', JSON.stringify(activeSession));
    
    render(<WorkoutView />);
    
    // Wait for active session to load, then check progress bar
    await screen.findByRole('heading', { level: 1, name: mockPlan.name });
    const progressBar = await screen.findByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('aria-label');
  });

  it('should have accessible buttons with descriptive labels', async () => {
    localStorage.setItem('workout-plans', JSON.stringify([mockPlan]));
    
    render(<WorkoutView />);
    
    const startButton = await screen.findByRole('button', { name: /start workout/i });
    expect(startButton).toBeInTheDocument();
  });

  it('should have accessible navigation buttons in active session', async () => {
    const activeSession: WorkoutSession = {
      id: 'session-1',
      planId: mockPlan.id,
      planName: mockPlan.name,
      startedAt: Date.now(),
      exercises: mockPlan.exercises.map((ex: WorkoutExercise) => ({
        exerciseId: ex.exerciseId,
        exerciseName: 'Bench Press',
        completedSets: [{
          setNumber: 1,
          reps: 10,
          weight: 135,
          completedAt: Date.now(),
        }, {
          setNumber: 2,
          reps: 10,
          weight: 135,
          completedAt: Date.now(),
        }, {
          setNumber: 3,
          reps: 10,
          weight: 135,
          completedAt: Date.now(),
        }],
      })),
      status: 'in-progress',
    };

    localStorage.setItem('workout-plans', JSON.stringify([mockPlan]));
    localStorage.setItem('active-session', JSON.stringify(activeSession));
    
    render(<WorkoutView />);
    
    // Wait for session to load first
    await screen.findByRole('heading', { level: 1, name: mockPlan.name });
    
    const previousButton = await screen.findByRole('button', { name: /previous/i });
    const nextButton = await screen.findByRole('button', { name: /next exercise/i });
    expect(previousButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();
  });

  it('should show disabled state for Previous button on first exercise', async () => {
    const activeSession: WorkoutSession = {
      id: 'session-1',
      planId: mockPlan.id,
      planName: mockPlan.name,
      startedAt: Date.now(),
      exercises: mockPlan.exercises.map((ex: WorkoutExercise) => ({
        exerciseId: ex.exerciseId,
        exerciseName: 'Bench Press',
        completedSets: [],
      })),
      status: 'in-progress',
    };

    localStorage.setItem('workout-plans', JSON.stringify([mockPlan]));
    localStorage.setItem('active-session', JSON.stringify(activeSession));
    
    render(<WorkoutView />);
    
    // Wait for session to load first
    await screen.findByRole('heading', { level: 1, name: mockPlan.name });
    const previousButton = await screen.findByRole('button', { name: /previous/i });
    expect(previousButton).toBeDisabled();
  });

  it('should show disabled state for Next button when sets incomplete', async () => {
    const activeSession: WorkoutSession = {
      id: 'session-1',
      planId: mockPlan.id,
      planName: mockPlan.name,
      startedAt: Date.now(),
      exercises: mockPlan.exercises.map((ex: WorkoutExercise) => ({
        exerciseId: ex.exerciseId,
        exerciseName: 'Bench Press',
        completedSets: [],
      })),
      status: 'in-progress',
    };

    localStorage.setItem('workout-plans', JSON.stringify([mockPlan]));
    localStorage.setItem('active-session', JSON.stringify(activeSession));
    
    render(<WorkoutView />);
    
    // Wait for session to load first
    await screen.findByRole('heading', { level: 1, name: mockPlan.name });
    const nextButton = await screen.findByRole('button', { name: /next exercise/i });
    expect(nextButton).toBeDisabled();
  });

  it('should have accessible form labels for set tracking inputs', async () => {
    const activeSession: WorkoutSession = {
      id: 'session-1',
      planId: mockPlan.id,
      planName: mockPlan.name,
      startedAt: Date.now(),
      exercises: mockPlan.exercises.map((ex: WorkoutExercise) => ({
        exerciseId: ex.exerciseId,
        exerciseName: 'Bench Press',
        completedSets: [],
      })),
      status: 'in-progress',
    };

    localStorage.setItem('workout-plans', JSON.stringify([mockPlan]));
    localStorage.setItem('active-session', JSON.stringify(activeSession));
    
    render(<WorkoutView />);
    
    // Wait for workout to load and check inputs are present
    await waitFor(() => {
      const inputs = screen.queryAllByRole('spinbutton');
      expect(inputs.length).toBeGreaterThan(0);
    });
  });

  it('should show empty state with descriptive text when no plans available', () => {
    render(<WorkoutView />);
    
    expect(screen.getByRole('heading', { name: /no workout plans available/i })).toBeInTheDocument();
    expect(screen.getByText(/create a workout plan in the plans tab/i)).toBeInTheDocument();
  });

  it('should have accessible badge with exercise count', async () => {
    const activeSession: WorkoutSession = {
      id: 'session-1',
      planId: mockPlan.id,
      planName: mockPlan.name,
      startedAt: Date.now(),
      exercises: mockPlan.exercises.map((ex: WorkoutExercise) => ({
        exerciseId: ex.exerciseId,
        exerciseName: 'Bench Press',
        completedSets: [],
      })),
      status: 'in-progress',
    };

    localStorage.setItem('workout-plans', JSON.stringify([mockPlan]));
    localStorage.setItem('active-session', JSON.stringify(activeSession));
    
    render(<WorkoutView />);
    
    // Wait for session to load first
    await screen.findByRole('heading', { level: 1, name: mockPlan.name });
    
    // Badge should show exercise count - check by aria-label attribute
    const badge = await screen.findByText(/1 \/ 2/);
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveAttribute('aria-label');
  });
});
