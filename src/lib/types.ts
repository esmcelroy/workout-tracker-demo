export type MuscleGroup = 
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'legs'
  | 'core'
  | 'cardio'
  | 'full-body';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  difficulty: Difficulty;
  instructions: string[];
  formCues: string[];
}

export interface WorkoutExercise {
  exerciseId: string;
  sets: number;
  reps: number;
  weight?: number;
  restSeconds?: number;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  exercises: WorkoutExercise[];
  createdAt: number;
}

export interface CompletedSet {
  setNumber: number;
  reps: number;
  weight?: number;
  completedAt: number;
}

export interface WorkoutSession {
  id: string;
  planId: string;
  planName: string;
  startedAt: number;
  completedAt?: number;
  exercises: {
    exerciseId: string;
    exerciseName: string;
    completedSets: CompletedSet[];
  }[];
  status: 'in-progress' | 'completed' | 'abandoned';
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  goals: string;
  difficulty: Difficulty;
  programType: 'strength' | 'hypertrophy' | 'powerlifting' | 'general-fitness';
  exercises: WorkoutExercise[];
}
