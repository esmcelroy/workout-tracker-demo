import { Exercise } from './types';

export const EXERCISE_LIBRARY: Exercise[] = [
  {
    id: 'barbell-squat',
    name: 'Barbell Squat',
    muscleGroup: 'legs',
    difficulty: 'intermediate',
    instructions: [
      'Position barbell on upper back/traps',
      'Stand with feet shoulder-width apart, toes slightly out',
      'Brace core and begin descent by breaking at hips and knees',
      'Lower until thighs are parallel to ground or deeper',
      'Drive through heels to return to starting position'
    ],
    formCues: [
      'Keep chest up and eyes forward',
      'Knees track over toes, not caving inward',
      'Maintain neutral spine throughout movement',
      'Full depth requires good ankle and hip mobility'
    ]
  },
  {
    id: 'bench-press',
    name: 'Barbell Bench Press',
    muscleGroup: 'chest',
    difficulty: 'intermediate',
    instructions: [
      'Lie on bench with eyes under the bar',
      'Grip bar slightly wider than shoulder width',
      'Unrack bar and position over mid-chest',
      'Lower bar to chest with control',
      'Press bar back to starting position'
    ],
    formCues: [
      'Retract shoulder blades and keep them pinned',
      'Maintain slight arch in lower back',
      'Elbows at 45-degree angle, not flared out',
      'Bar path should be slight arc, not straight'
    ]
  },
  {
    id: 'deadlift',
    name: 'Conventional Deadlift',
    muscleGroup: 'back',
    difficulty: 'advanced',
    instructions: [
      'Stand with feet hip-width apart, bar over mid-foot',
      'Hinge at hips and grip bar just outside legs',
      'Set back by pulling shoulder blades down',
      'Drive through floor with legs while keeping bar close',
      'Stand fully upright, then reverse movement with control'
    ],
    formCues: [
      'Start with hips higher than knees but lower than shoulders',
      'Maintain neutral spine - no rounding or hyperextension',
      'Bar should travel in straight vertical line',
      'Full hip extension at top, squeeze glutes'
    ]
  },
  {
    id: 'pull-up',
    name: 'Pull-Up',
    muscleGroup: 'back',
    difficulty: 'intermediate',
    instructions: [
      'Hang from bar with hands shoulder-width or slightly wider',
      'Start from dead hang with arms fully extended',
      'Pull body up by driving elbows down',
      'Continue until chin clears bar',
      'Lower with control back to dead hang'
    ],
    formCues: [
      'Engage lats before pulling, avoid arm-only pull',
      'Keep core tight to prevent swinging',
      'Full range of motion - dead hang to chin over bar',
      'Avoid kipping unless training specifically for it'
    ]
  },
  {
    id: 'overhead-press',
    name: 'Overhead Press',
    muscleGroup: 'shoulders',
    difficulty: 'intermediate',
    instructions: [
      'Start with bar at shoulder height, hands just outside shoulders',
      'Brace core and squeeze glutes',
      'Press bar straight up, moving head back slightly',
      'Lock out arms overhead with biceps by ears',
      'Lower bar back to shoulders with control'
    ],
    formCues: [
      'Keep forearms vertical throughout movement',
      'Avoid excessive lower back arch',
      'Press bar in straight line, not forward arc',
      'Full lockout requires shoulder mobility'
    ]
  },
  {
    id: 'dumbbell-row',
    name: 'Single-Arm Dumbbell Row',
    muscleGroup: 'back',
    difficulty: 'beginner',
    instructions: [
      'Place one hand and knee on bench for support',
      'Hold dumbbell in opposite hand, arm extended',
      'Pull dumbbell up to ribcage, driving elbow back',
      'Squeeze shoulder blade at top',
      'Lower with control and repeat'
    ],
    formCues: [
      'Keep torso parallel to ground',
      'Row to hip, not straight up',
      'Minimize rotation in torso',
      'Feel contraction in lat, not just arm'
    ]
  },
  {
    id: 'plank',
    name: 'Plank',
    muscleGroup: 'core',
    difficulty: 'beginner',
    instructions: [
      'Start on forearms and toes',
      'Keep body in straight line from head to heels',
      'Engage core and squeeze glutes',
      'Hold position for prescribed time',
      'Breathe normally throughout'
    ],
    formCues: [
      'Avoid sagging hips or raised hips',
      'Push forearms into ground to engage shoulders',
      'Look at ground to maintain neutral neck',
      'Quality over duration - maintain perfect form'
    ]
  },
  {
    id: 'bicep-curl',
    name: 'Barbell Bicep Curl',
    muscleGroup: 'biceps',
    difficulty: 'beginner',
    instructions: [
      'Stand with feet hip-width, holding barbell with underhand grip',
      'Keep elbows tucked at sides',
      'Curl bar up while keeping upper arms stationary',
      'Squeeze biceps at top',
      'Lower with control to full extension'
    ],
    formCues: [
      'No swinging or momentum - strict form',
      'Elbows stay in same position throughout',
      'Full range of motion - complete extension to full contraction',
      'Control the eccentric (lowering) phase'
    ]
  },
  {
    id: 'tricep-dip',
    name: 'Tricep Dips',
    muscleGroup: 'triceps',
    difficulty: 'intermediate',
    instructions: [
      'Support body on parallel bars with arms extended',
      'Lean forward slightly',
      'Lower body by bending elbows to 90 degrees',
      'Press back up to starting position',
      'Keep core engaged throughout'
    ],
    formCues: [
      'Keep shoulders down, away from ears',
      'Elbows track back, not flared out',
      'Control descent, avoid dropping',
      'Adjust forward lean for chest vs tricep emphasis'
    ]
  },
  {
    id: 'romanian-deadlift',
    name: 'Romanian Deadlift',
    muscleGroup: 'legs',
    difficulty: 'intermediate',
    instructions: [
      'Start standing with barbell at hip level',
      'Soften knees slightly and hinge at hips',
      'Lower bar along thighs while pushing hips back',
      'Feel stretch in hamstrings, bar to mid-shin',
      'Drive hips forward to return to standing'
    ],
    formCues: [
      'Maintain neutral spine throughout',
      'Bar stays close to body entire movement',
      'Feel stretch in hamstrings, not lower back',
      'Hinge at hips, minimal knee bend'
    ]
  },
  {
    id: 'lunges',
    name: 'Walking Lunges',
    muscleGroup: 'legs',
    difficulty: 'beginner',
    instructions: [
      'Stand with feet hip-width apart',
      'Step forward with one leg',
      'Lower hips until both knees at 90 degrees',
      'Push through front heel to step forward with back leg',
      'Continue alternating legs'
    ],
    formCues: [
      'Front knee stays over ankle, not past toes',
      'Back knee hovers just above ground',
      'Keep torso upright, core engaged',
      'Equal weight distribution between legs'
    ]
  },
  {
    id: 'push-up',
    name: 'Push-Up',
    muscleGroup: 'chest',
    difficulty: 'beginner',
    instructions: [
      'Start in high plank position, hands shoulder-width',
      'Keep body in straight line',
      'Lower chest to ground by bending elbows',
      'Push through hands to return to start',
      'Maintain core engagement throughout'
    ],
    formCues: [
      'Elbows at 45-degree angle, not flared',
      'Full range - chest to ground or near it',
      'No sagging hips or piked hips',
      'Protract shoulder blades at top'
    ]
  },
  {
    id: 'lat-pulldown',
    name: 'Lat Pulldown',
    muscleGroup: 'back',
    difficulty: 'beginner',
    instructions: [
      'Sit at lat pulldown machine, secure thighs under pad',
      'Grip bar slightly wider than shoulder width',
      'Pull bar down to upper chest',
      'Squeeze shoulder blades together',
      'Return to start with control'
    ],
    formCues: [
      'Slight lean back is acceptable',
      'Pull with lats, not just arms',
      'Keep chest up throughout movement',
      'Avoid excessive momentum or body swing'
    ]
  },
  {
    id: 'cable-fly',
    name: 'Cable Chest Fly',
    muscleGroup: 'chest',
    difficulty: 'beginner',
    instructions: [
      'Set cables to shoulder height, grab handles',
      'Step forward into split stance for stability',
      'Start with arms extended out to sides, slight bend in elbows',
      'Bring hands together in front of chest',
      'Return to start position with control'
    ],
    formCues: [
      'Maintain same elbow angle throughout',
      'Focus on chest squeeze, not arm movement',
      'Slight forward lean, chest up',
      'Control the stretch at the bottom'
    ]
  },
  {
    id: 'leg-press',
    name: 'Leg Press',
    muscleGroup: 'legs',
    difficulty: 'beginner',
    instructions: [
      'Sit in leg press machine, feet shoulder-width on platform',
      'Release safety and lower platform by bending knees',
      'Lower until knees at 90 degrees or slightly more',
      'Press through heels to extend legs',
      'Stop just before lockout to maintain tension'
    ],
    formCues: [
      'Keep lower back pressed against pad',
      'Knees track in line with toes',
      'Full range of motion without butt lifting off seat',
      'Controlled eccentric, explosive concentric'
    ]
  }
];
