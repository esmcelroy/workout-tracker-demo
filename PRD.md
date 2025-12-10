# Planning Guide

A comprehensive workout tracking application that allows users to collect workout plans, receive real-time form feedback and exercise instructions, and track their fitness progress over time.

**Experience Qualities**:
1. **Motivating** - The interface should energize users and celebrate their progress, making every workout session feel like an achievement worth pursuing.
2. **Clear** - Exercise instructions and feedback must be instantly understandable with zero ambiguity, ensuring users can focus on form rather than interface navigation.
3. **Efficient** - Workout logging should be lightning-fast with minimal taps, respecting that users are often tracking mid-exercise with limited attention.

**Complexity Level**: Light Application (multiple features with basic state)
  - The app manages workout plans, exercise libraries, tracking history, and AI-generated feedback, but doesn't require accounts or server synchronization since all data persists locally.

## Essential Features

### Workout Plan Collection
- **Functionality**: Users can create, edit, and organize custom workout plans with multiple exercises, sets, reps, and rest periods
- **Purpose**: Provides structure and organization for varied training routines (strength, cardio, flexibility)
- **Trigger**: User clicks "New Plan" button or selects existing plan to edit
- **Progression**: Click New Plan → Enter plan name & description → Add exercises from library → Set reps/sets/weight → Save plan → Plan appears in collection
- **Success criteria**: Plans persist between sessions, can be edited/deleted, and contain all necessary exercise parameters

### Exercise Library & Instructions
- **Functionality**: Searchable database of exercises with detailed instructions, muscle groups, and difficulty levels
- **Purpose**: Educates users on proper form and helps them discover new exercises to add to their routines
- **Trigger**: User browses library or searches for specific exercise when building a plan
- **Progression**: Open library → Search/filter by muscle group or name → Select exercise → View detailed instructions & form cues → Add to active plan
- **Success criteria**: Library is easily searchable, instructions are clear and detailed, exercises can be quickly added to plans

### Workout Tracking & Logging
- **Functionality**: Active workout session interface where users log completed sets, reps, and weights in real-time
- **Purpose**: Captures performance data to measure progress and ensure progressive overload
- **Trigger**: User selects a workout plan and clicks "Start Workout"
- **Progression**: Select plan → Start workout → Complete set → Log reps/weight → Mark set complete → Move to next exercise → Finish workout → Save session
- **Success criteria**: Logging is fast and intuitive, sessions save automatically, incomplete workouts can be resumed

### AI-Powered Form Feedback
- **Functionality**: When user requests feedback on an exercise, AI analyzes their description/concerns and provides personalized form tips and corrections
- **Purpose**: Helps users improve technique and prevent injury when training alone
- **Trigger**: User clicks "Get Form Feedback" during exercise and describes their concern or form question
- **Progression**: Click feedback button → Describe form question → AI analyzes → Receive personalized tips → Apply feedback to training
- **Success criteria**: Feedback is specific, actionable, and arrives within 3 seconds

### Progress Tracking & History
- **Functionality**: Visual charts and logs showing workout history, volume trends, and personal records
- **Purpose**: Motivates users by showing tangible progress and helps identify plateaus
- **Trigger**: User navigates to Progress tab
- **Progression**: Open progress view → Select time range or exercise → View charts/logs → Identify trends → Adjust training plan
- **Success criteria**: Data visualizes clearly, trends are obvious, users can drill down into specific exercises or dates

## Edge Case Handling

- **Empty States** - First-time users see helpful onboarding cards explaining how to create their first workout plan with example exercises
- **Incomplete Workouts** - If user exits mid-workout, session saves as draft and can be resumed or discarded on next visit
- **No Exercise Data** - When viewing progress for exercises never performed, show encouraging message to try that movement
- **AI Feedback Errors** - If AI request fails, show cached common form tips for that exercise instead of error message
- **Duplicate Exercise Names** - Exercise library prevents exact duplicates but allows variations (e.g., "Barbell Squat" vs "Goblet Squat")

## Design Direction

The design should feel athletic and energizing like a premium fitness app - clean, bold, and confidence-inspiring with just enough motion to feel alive. Minimal interface that gets out of the way during workouts, but rich with data and insights when reviewing progress.

## Color Selection

Triadic color scheme - using three equally spaced colors to create vibrant energy while maintaining balance, reflecting the dynamic nature of fitness training.

- **Primary Color**: Deep Energetic Blue (oklch(0.45 0.15 250)) - Conveys trust, focus, and athleticism for primary actions
- **Secondary Colors**: 
  - Slate Gray (oklch(0.35 0.02 250)) - Grounding neutral for cards and secondary elements
  - Light Background (oklch(0.98 0.005 250)) - Soft, easy-on-eyes base
- **Accent Color**: Vibrant Lime Green (oklch(0.75 0.18 130)) - High-energy highlight for completed sets, achievements, and CTAs suggesting growth and vitality
- **Foreground/Background Pairings**:
  - Background (Light Gray oklch(0.98 0.005 250)): Dark Text oklch(0.2 0.02 250) - Ratio 13.2:1 ✓
  - Card (White oklch(1 0 0)): Dark Text oklch(0.2 0.02 250) - Ratio 15.1:1 ✓
  - Primary (Deep Blue oklch(0.45 0.15 250)): White Text oklch(1 0 0) - Ratio 7.8:1 ✓
  - Secondary (Slate oklch(0.35 0.02 250)): White Text oklch(1 0 0) - Ratio 11.2:1 ✓
  - Accent (Lime Green oklch(0.75 0.18 130)): Dark Text oklch(0.15 0.02 250) - Ratio 10.5:1 ✓
  - Muted (Light Slate oklch(0.92 0.01 250)): Medium Text oklch(0.45 0.02 250) - Ratio 5.2:1 ✓

## Font Selection

Typography should feel athletic and modern - strong, readable, and slightly technical like sports performance tracking. Inter provides the geometric precision and excellent legibility needed for workout data.

- **Typographic Hierarchy**:
  - H1 (Page Titles): Inter Bold/32px/tight (-0.02em) - Strong presence for main screens
  - H2 (Section Headers): Inter Semibold/24px/tight (-0.01em) - Clear hierarchy for workout sections
  - H3 (Exercise Names): Inter Semibold/18px/normal - Scannable during active workouts
  - Body (Instructions): Inter Regular/16px/relaxed (1.6) - Comfortable reading for form cues
  - Small (Stats/Meta): Inter Medium/14px/normal - Data-dense information
  - Button Labels: Inter Semibold/15px/normal - Clear action prompts

## Animations

Animations should feel snappy and responsive like an athlete's movements - quick, purposeful, and energizing without being distracting during workout focus time.

- **Purposeful Meaning**: Motion celebrates achievements (completed sets expand with spring physics) and guides flow (exercise cards slide smoothly when advancing)
- **Hierarchy of Movement**: 
  - High priority: Set completion animations (satisfying micro-celebration)
  - Medium priority: Screen transitions between exercises (maintain context)
  - Low priority: Hover states on buttons (subtle lift effect)

## Component Selection

- **Components**: 
  - Cards - Workout plan containers and exercise cards with hover lift effect
  - Tabs - Main navigation between Plans, Active Workout, Progress, Library
  - Dialog - Creating/editing workout plans and exercises
  - Progress indicators - Set completion and workout progress bars
  - Accordion - Expandable exercise instructions in library
  - Checkbox - Marking sets as complete with satisfying check animation
  - Input - Quick number entry for reps/weight with large touch targets
  - ScrollArea - Exercise library and long workout plans
  - Badge - Muscle group tags and difficulty indicators
  - Button - Primary actions with vibrant accent color for CTAs
  
- **Customizations**: 
  - Custom exercise card component with image placeholder and quick-add button
  - Workout timer component with large readable numbers
  - Progress chart component using recharts for volume tracking
  - Set logger component with increment/decrement buttons for quick weight adjustments
  
- **States**: 
  - Buttons: Default subtle shadow, hover lifts 2px with stronger shadow, active scales 98%, disabled reduces opacity to 40%
  - Inputs: Default with border, focus shows accent ring, filled shows success checkmark
  - Exercise cards: Default flat, hover elevates with shadow, selected shows accent left border
  - Set rows: Pending (muted), Active (primary highlight), Complete (accent green with checkmark)
  
- **Icon Selection**: 
  - Barbell (weight training plans)
  - Plus (add exercise/plan)
  - Play (start workout)
  - CheckCircle (complete set)
  - TrendUp (progress view)
  - Lightning (AI feedback)
  - MagnifyingGlass (search exercises)
  - Timer (rest periods)
  
- **Spacing**: 
  - Section gaps: gap-8 (2rem) for main layout sections
  - Card internal padding: p-6 (1.5rem) for breathing room
  - List items: gap-3 (0.75rem) for scannable exercise lists
  - Button padding: px-6 py-3 for comfortable touch targets
  - Form fields: gap-4 (1rem) between related inputs
  
- **Mobile**: 
  - Tabs convert to bottom navigation bar on mobile for thumb-zone access
  - Exercise cards stack vertically with full width below 768px
  - Set logger buttons increase to 48px touch targets on mobile
  - Progress charts adapt to portrait orientation with vertical emphasis
  - Workout plans collapse to show only exercise names until expanded
  - Dialog forms become full-screen sheets on mobile for easier data entry
