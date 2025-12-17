import { WorkoutTemplate } from './types';

export const WORKOUT_TEMPLATES: WorkoutTemplate[] = [
  {
    id: 'push-pull-legs',
    name: 'Push/Pull/Legs (PPL)',
    description: '3-day split focusing on pushing muscles, pulling muscles, and legs separately',
    goals: 'Build muscle mass and strength with optimal recovery. Perfect for intermediate lifters looking to train 3-6 days per week.',
    difficulty: 'intermediate',
    programType: 'hypertrophy',
    exercises: [
      { exerciseId: 'bench-press', sets: 4, reps: 8, weight: 135, restSeconds: 120 },
      { exerciseId: 'overhead-press', sets: 3, reps: 10, weight: 65, restSeconds: 90 },
      { exerciseId: 'cable-fly', sets: 3, reps: 12, weight: 30, restSeconds: 60 },
      { exerciseId: 'tricep-dip', sets: 3, reps: 10, restSeconds: 90 }
    ]
  },
  {
    id: '5x5-stronglifts',
    name: '5x5 Stronglifts',
    description: 'Classic strength-building program with 5 sets of 5 reps on compound movements',
    goals: 'Build raw strength and muscle foundation. Ideal for beginners and those returning to lifting after a break.',
    difficulty: 'beginner',
    programType: 'strength',
    exercises: [
      { exerciseId: 'barbell-squat', sets: 5, reps: 5, weight: 135, restSeconds: 180 },
      { exerciseId: 'bench-press', sets: 5, reps: 5, weight: 115, restSeconds: 180 },
      { exerciseId: 'dumbbell-row', sets: 5, reps: 5, weight: 50, restSeconds: 120 }
    ]
  },
  {
    id: 'upper-lower-split',
    name: 'Upper/Lower Split',
    description: '4-day program alternating between upper and lower body workouts',
    goals: 'Maximize muscle growth and strength with balanced frequency. Great for intermediate to advanced lifters training 4 days per week.',
    difficulty: 'intermediate',
    programType: 'hypertrophy',
    exercises: [
      { exerciseId: 'bench-press', sets: 4, reps: 6, weight: 155, restSeconds: 120 },
      { exerciseId: 'pull-up', sets: 4, reps: 8, restSeconds: 120 },
      { exerciseId: 'overhead-press', sets: 3, reps: 10, weight: 75, restSeconds: 90 },
      { exerciseId: 'dumbbell-row', sets: 3, reps: 10, weight: 60, restSeconds: 90 }
    ]
  },
  {
    id: 'full-body-beginner',
    name: 'Full Body for Beginners',
    description: 'Complete full-body workout hitting all major muscle groups',
    goals: 'Build overall fitness, learn proper form, and establish workout routine. Perfect for complete beginners starting their fitness journey.',
    difficulty: 'beginner',
    programType: 'general-fitness',
    exercises: [
      { exerciseId: 'barbell-squat', sets: 3, reps: 10, weight: 95, restSeconds: 90 },
      { exerciseId: 'push-up', sets: 3, reps: 12, restSeconds: 60 },
      { exerciseId: 'dumbbell-row', sets: 3, reps: 10, weight: 35, restSeconds: 90 },
      { exerciseId: 'overhead-press', sets: 3, reps: 10, weight: 45, restSeconds: 90 },
      { exerciseId: 'plank', sets: 3, reps: 30, restSeconds: 60 }
    ]
  },
  {
    id: 'powerlifting-big-three',
    name: 'Powerlifting - Big 3',
    description: 'Focus on the three powerlifting competition lifts: squat, bench press, and deadlift',
    goals: 'Maximize strength in the three main powerlifting movements. Designed for advanced lifters preparing for competition or strength goals.',
    difficulty: 'advanced',
    programType: 'powerlifting',
    exercises: [
      { exerciseId: 'barbell-squat', sets: 5, reps: 3, weight: 225, restSeconds: 240 },
      { exerciseId: 'bench-press', sets: 5, reps: 3, weight: 185, restSeconds: 240 },
      { exerciseId: 'deadlift', sets: 5, reps: 3, weight: 275, restSeconds: 300 }
    ]
  },
  {
    id: 'hypertrophy-chest-back',
    name: 'Chest & Back Hypertrophy',
    description: 'High-volume workout targeting chest and back for maximum muscle growth',
    goals: 'Build muscle mass in upper body pulling and pushing muscles. Great for intermediate lifters in a hypertrophy phase.',
    difficulty: 'intermediate',
    programType: 'hypertrophy',
    exercises: [
      { exerciseId: 'bench-press', sets: 4, reps: 10, weight: 135, restSeconds: 90 },
      { exerciseId: 'dumbbell-row', sets: 4, reps: 10, weight: 55, restSeconds: 90 },
      { exerciseId: 'cable-fly', sets: 3, reps: 15, weight: 25, restSeconds: 60 },
      { exerciseId: 'lat-pulldown', sets: 3, reps: 12, weight: 100, restSeconds: 60 },
      { exerciseId: 'push-up', sets: 3, reps: 15, restSeconds: 45 }
    ]
  },
  {
    id: 'leg-day-strength',
    name: 'Leg Day - Strength Focus',
    description: 'Complete lower body workout emphasizing strength and power',
    goals: 'Build lower body strength and muscle. Ideal for lifters who want to focus on leg development and strength gains.',
    difficulty: 'intermediate',
    programType: 'strength',
    exercises: [
      { exerciseId: 'barbell-squat', sets: 5, reps: 5, weight: 185, restSeconds: 180 },
      { exerciseId: 'romanian-deadlift', sets: 4, reps: 8, weight: 155, restSeconds: 120 },
      { exerciseId: 'leg-press', sets: 4, reps: 12, weight: 270, restSeconds: 90 },
      { exerciseId: 'lunges', sets: 3, reps: 12, weight: 40, restSeconds: 90 }
    ]
  },
  {
    id: 'bodyweight-basics',
    name: 'Bodyweight Basics',
    description: 'No equipment needed - build strength using only your bodyweight',
    goals: 'Develop functional strength and fitness anywhere. Perfect for beginners, home workouts, or travel.',
    difficulty: 'beginner',
    programType: 'general-fitness',
    exercises: [
      { exerciseId: 'push-up', sets: 4, reps: 12, restSeconds: 60 },
      { exerciseId: 'pull-up', sets: 3, reps: 6, restSeconds: 90 },
      { exerciseId: 'lunges', sets: 3, reps: 15, restSeconds: 60 },
      { exerciseId: 'plank', sets: 3, reps: 45, restSeconds: 60 }
    ]
  },
  {
    id: 'advanced-strength-builder',
    name: 'Advanced Strength Builder',
    description: 'High-intensity program combining heavy compounds with strategic accessory work',
    goals: 'Push strength limits while maintaining muscle mass. For experienced lifters ready for advanced programming.',
    difficulty: 'advanced',
    programType: 'strength',
    exercises: [
      { exerciseId: 'deadlift', sets: 5, reps: 3, weight: 315, restSeconds: 240 },
      { exerciseId: 'bench-press', sets: 5, reps: 5, weight: 205, restSeconds: 180 },
      { exerciseId: 'barbell-squat', sets: 4, reps: 6, weight: 245, restSeconds: 180 },
      { exerciseId: 'overhead-press', sets: 4, reps: 6, weight: 115, restSeconds: 120 },
      { exerciseId: 'pull-up', sets: 4, reps: 8, restSeconds: 90 }
    ]
  },
  {
    id: 'conditioning-circuit',
    name: 'Conditioning Circuit',
    description: 'Fast-paced circuit training for cardiovascular fitness and endurance',
    goals: 'Improve cardiovascular endurance, burn calories, and maintain muscle. Great for general fitness and conditioning.',
    difficulty: 'beginner',
    programType: 'general-fitness',
    exercises: [
      { exerciseId: 'barbell-squat', sets: 3, reps: 15, weight: 75, restSeconds: 30 },
      { exerciseId: 'push-up', sets: 3, reps: 15, restSeconds: 30 },
      { exerciseId: 'dumbbell-row', sets: 3, reps: 15, weight: 30, restSeconds: 30 },
      { exerciseId: 'lunges', sets: 3, reps: 20, restSeconds: 30 },
      { exerciseId: 'plank', sets: 3, reps: 30, restSeconds: 30 }
    ]
  }
];
