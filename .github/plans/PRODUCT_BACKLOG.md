# FitTrack Product Backlog

> **Last Updated**: December 12, 2025  
> **Status**: Draft - Ready for prioritization

This backlog captures planned features, enhancements, and technical improvements for FitTrack. Items are organized by category and include rough effort estimates and priority indicators.

---

## 🚀 High Priority Features

### 1. User Authentication & Multi-User Support
**Type**: Feature | **Effort**: Large | **Labels**: `enhancement`, `backend`, `security`

**Description**: Add user accounts so multiple users can track their own workout data separately. Currently all data is shared in a single JSON store.

**Acceptance Criteria**:
- [x] User registration with email/password
- [x] User login/logout functionality
- [x] User-scoped data isolation (each user sees only their plans/sessions)
- [x] Password reset flow
- [x] Session management with JWT or similar

**Technical Notes**:
- Consider OAuth providers (Google, GitHub) for easier onboarding
- Backend needs user table and foreign keys on all data
- Frontend needs auth context and protected routes

---

### 2. Rest Timer with Audio Alerts
**Type**: Feature | **Effort**: Small | **Labels**: `enhancement`, `ux`

**Description**: During active workouts, provide a configurable rest timer between sets with optional audio/vibration alerts when rest period ends.

**Acceptance Criteria**:
- [ ] Timer starts automatically after completing a set
- [ ] Default rest time configurable per exercise (30s, 60s, 90s, etc.)
- [ ] Visual countdown display during rest
- [ ] Audio alert when timer ends (with mute option)
- [ ] Vibration on mobile devices
- [ ] Skip timer button to proceed immediately

**Technical Notes**:
- Use Web Audio API for reliable sound playback
- Store user's preferred rest times in settings

---

### 3. Workout Templates & Pre-built Programs
**Type**: Feature | **Effort**: Medium | **Labels**: `enhancement`, `content`

**Description**: Provide pre-built workout templates (Push/Pull/Legs, 5x5 Stronglifts, etc.) that users can import and customize.

**Acceptance Criteria**:
- [ ] Library of 5-10 popular workout programs
- [ ] One-click import to user's plans
- [ ] Imported plans are fully editable
- [ ] Clear descriptions of each program's goals
- [ ] Difficulty/experience level indicators

**Technical Notes**:
- Store templates as static JSON in codebase
- Consider community-contributed templates in future

---

### 4. Progressive Overload Suggestions
**Type**: Feature | **Effort**: Medium | **Labels**: `enhancement`, `ai`

**Description**: Analyze user's workout history and suggest weight/rep increases to ensure progressive overload - the key to muscle growth.

**Acceptance Criteria**:
- [ ] Track performance trends per exercise
- [ ] Suggest weight increases when user hits rep targets consistently
- [ ] Show "You lifted X more than last week" celebrations
- [ ] Optional notifications for suggested progressions
- [ ] Account for deload weeks

**Technical Notes**:
- Algorithm: If user hits target reps for 3 consecutive sessions, suggest 5% weight increase
- Display suggestions in WorkoutView before starting exercise

---

### 5. Offline Mode with Sync
**Type**: Feature | **Effort**: Large | **Labels**: `enhancement`, `pwa`

**Description**: Allow full app functionality without internet connection, syncing data when connection is restored.

**Acceptance Criteria**:
- [ ] App works offline (service worker caching)
- [ ] Workouts can be logged offline
- [ ] Data syncs automatically when online
- [ ] Conflict resolution for concurrent edits
- [ ] Visual indicator of sync status

**Technical Notes**:
- Implement service worker for asset caching
- Use IndexedDB for offline data storage
- Queue API calls when offline, replay on reconnect

---

## 📊 Progress & Analytics Enhancements

### 6. Personal Records (PR) Tracking
**Type**: Feature | **Effort**: Small | **Labels**: `enhancement`, `progress`

**Description**: Automatically track and celebrate personal records for each exercise (1RM, max reps, highest volume).

**Acceptance Criteria**:
- [ ] Detect new PRs automatically during workout logging
- [ ] Celebratory animation/notification on new PR
- [ ] PR history view showing all-time bests per exercise
- [ ] Estimated 1RM calculation from rep data
- [ ] Badge/achievement for milestone PRs

**Technical Notes**:
- 1RM formula: weight × (1 + reps/30) (Epley formula)
- Store PR history as separate data key

---

### 7. Volume & Frequency Analytics
**Type**: Feature | **Effort**: Medium | **Labels**: `enhancement`, `progress`

**Description**: Enhanced progress charts showing weekly volume per muscle group, workout frequency, and training balance.

**Acceptance Criteria**:
- [ ] Weekly volume chart by muscle group
- [ ] Workout frequency heatmap (GitHub-style calendar)
- [ ] Muscle group balance indicator (are you skipping legs?)
- [ ] Customizable date range selection
- [ ] Export data as CSV

**Technical Notes**:
- Calculate volume as sets × reps × weight
- Use Recharts for new visualizations

---

### 8. Body Measurements Tracking
**Type**: Feature | **Effort**: Medium | **Labels**: `enhancement`, `progress`

**Description**: Track body measurements (weight, body fat %, measurements) over time alongside workout data.

**Acceptance Criteria**:
- [ ] Add body measurement entries with date
- [ ] Track: weight, body fat %, chest, waist, arms, legs, etc.
- [ ] Progress photos with date stamps (optional)
- [ ] Charts showing measurement trends
- [ ] Goal setting for measurements

**Technical Notes**:
- New data type: `BodyMeasurement` with flexible fields
- Photo storage requires file upload backend (future cloud migration)

---

## 🏋️ Workout Experience Improvements

### 9. Exercise Substitutions
**Type**: Feature | **Effort**: Small | **Labels**: `enhancement`, `ux`

**Description**: During a workout, allow users to swap an exercise for an equivalent alternative (e.g., barbell bench → dumbbell bench).

**Acceptance Criteria**:
- [ ] "Swap Exercise" button on each exercise during workout
- [ ] Suggest alternatives targeting same muscle group
- [ ] Maintain set/rep targets from original exercise
- [ ] Log substitution in workout history
- [ ] Save common substitutions for future use

**Technical Notes**:
- Add `alternativeIds` field to Exercise type
- Curate substitution mappings in exercise library

---

### 10. Superset & Circuit Support
**Type**: Feature | **Effort**: Medium | **Labels**: `enhancement`, `workout`

**Description**: Allow grouping exercises into supersets (back-to-back) or circuits (rotating through multiple exercises).

**Acceptance Criteria**:
- [ ] Group exercises as superset in plan editor
- [ ] Visual distinction for superset exercises
- [ ] Workout flow handles supersets correctly
- [ ] Rest timer only after completing superset
- [ ] Circuit mode with configurable rounds

**Technical Notes**:
- Extend `WorkoutPlan.exercises` to support grouping
- New UI component for superset visualization

---

### 11. Custom Exercise Creation
**Type**: Feature | **Effort**: Small | **Labels**: `enhancement`, `library`

**Description**: Allow users to add their own custom exercises to the library beyond the pre-built collection.

**Acceptance Criteria**:
- [ ] "Add Custom Exercise" button in Library
- [ ] Form for name, muscle group, difficulty, instructions
- [ ] Custom exercises available in plan builder
- [ ] Edit/delete custom exercises
- [ ] Optional: share custom exercises (future)

**Technical Notes**:
- Store custom exercises in user-specific data key
- Merge with EXERCISE_LIBRARY at runtime

---

### 12. Workout Notes & Exercise Notes
**Type**: Feature | **Effort**: Small | **Labels**: `enhancement`, `ux`

**Description**: Add free-text notes to workouts and individual exercises for tracking form cues, how you felt, equipment used, etc.

**Acceptance Criteria**:
- [ ] Add notes to overall workout session
- [ ] Add notes to individual exercises during workout
- [ ] Notes visible in workout history
- [ ] Search/filter by notes content

**Technical Notes**:
- Add `notes` field to `WorkoutSession` and exercise entries
- Simple textarea input, no rich text needed

---

## 🤖 AI & Smart Features

### 13. AI Workout Plan Generator
**Type**: Feature | **Effort**: Medium | **Labels**: `enhancement`, `ai`

**Description**: Generate personalized workout plans based on user's goals, available equipment, and experience level.

**Acceptance Criteria**:
- [ ] Questionnaire: goals, experience, available equipment, days/week
- [ ] AI generates complete workout plan
- [ ] User can edit generated plan before saving
- [ ] Multiple plan options to choose from
- [ ] Regenerate with different parameters

**Technical Notes**:
- Use GitHub Copilot API or similar LLM
- Prompt engineering for structured workout output
- Validate generated exercises against library

---

### 14. Form Check via Video (Future)
**Type**: Feature | **Effort**: Extra Large | **Labels**: `enhancement`, `ai`, `future`

**Description**: Users can upload or stream exercise video for AI-powered form analysis and feedback.

**Acceptance Criteria**:
- [ ] Video upload during workout
- [ ] AI analyzes movement patterns
- [ ] Specific feedback on form issues
- [ ] Comparison to ideal form
- [ ] Privacy-first (process locally if possible)

**Technical Notes**:
- Requires pose estimation model (MediaPipe, TensorFlow.js)
- Significant complexity - mark as future/v2

---

### 15. Smart Exercise Recommendations
**Type**: Feature | **Effort**: Medium | **Labels**: `enhancement`, `ai`

**Description**: Based on workout history, recommend exercises user hasn't tried that would complement their routine.

**Acceptance Criteria**:
- [ ] Identify muscle groups user under-trains
- [ ] Suggest exercises to balance routine
- [ ] "Try something new" weekly recommendation
- [ ] Filter recommendations by available equipment
- [ ] Dismiss/save recommendations

**Technical Notes**:
- Analyze muscle group frequency from workout history
- Surface underrepresented groups with exercise suggestions

---

## 🔧 Technical Improvements

### 16. Database Migration (PostgreSQL/Supabase)
**Type**: Technical | **Effort**: Large | **Labels**: `backend`, `infrastructure`

**Description**: Replace JSON file storage with a proper database for better scalability, querying, and multi-user support.

**Acceptance Criteria**:
- [ ] Database schema for all data types
- [ ] Migration script from JSON files
- [ ] Updated API layer for database queries
- [ ] Transaction support for data integrity
- [ ] Backup/restore procedures

**Technical Notes**:
- Supabase provides PostgreSQL + Auth + Realtime
- Minimal frontend changes (API layer abstraction)

---

### 17. Comprehensive Test Suite
**Type**: Technical | **Effort**: Medium | **Labels**: `testing`, `quality`

**Description**: Add unit tests, integration tests, and E2E tests to ensure reliability and enable confident refactoring.

**Acceptance Criteria**:
- [ ] Unit tests for utility functions and hooks
- [ ] Component tests for main views
- [ ] API endpoint tests for backend
- [ ] E2E tests for critical user flows
- [ ] CI pipeline running tests on PR

**Technical Notes**:
- Vitest for unit/component tests
- Playwright for E2E (already configured)
- Target 80% code coverage

---

### 18. Performance Optimization
**Type**: Technical | **Effort**: Medium | **Labels**: `performance`

**Description**: Optimize app performance for large workout histories and smooth animations on mobile.

**Acceptance Criteria**:
- [ ] Lazy load progress charts
- [ ] Virtualized lists for long workout histories
- [ ] Optimized re-renders with React.memo
- [ ] Bundle size analysis and reduction
- [ ] Lighthouse score > 90

**Technical Notes**:
- Use React.lazy for code splitting
- Consider react-window for virtualization
- Profile with React DevTools

---

### 19. Accessibility Improvements
**Type**: Technical | **Effort**: Medium | **Labels**: `accessibility`, `quality`

**Description**: Ensure the app is fully accessible to users with disabilities.

**Acceptance Criteria**:
- [ ] WCAG 2.1 AA compliance
- [ ] Keyboard navigation for all features
- [ ] Screen reader compatible
- [ ] Sufficient color contrast
- [ ] Focus indicators visible
- [ ] Accessible form labels and errors

**Technical Notes**:
- Audit with axe-core
- Test with VoiceOver/NVDA
- Radix UI provides good a11y foundation

---

### 20. Error Monitoring & Analytics
**Type**: Technical | **Effort**: Small | **Labels**: `infrastructure`, `monitoring`

**Description**: Add error tracking and usage analytics to understand issues and user behavior.

**Acceptance Criteria**:
- [ ] Error tracking (Sentry or similar)
- [ ] Basic usage analytics (privacy-respecting)
- [ ] Performance monitoring
- [ ] Dashboard for metrics
- [ ] Alerts for critical errors

**Technical Notes**:
- Sentry free tier for error tracking
- Plausible or Umami for privacy-friendly analytics

---

## 📱 Platform & Distribution

### 21. PWA Installation Support
**Type**: Feature | **Effort**: Small | **Labels**: `pwa`, `distribution`

**Description**: Enable "Add to Home Screen" functionality for a native-like experience on mobile.

**Acceptance Criteria**:
- [ ] Web app manifest configured
- [ ] Install prompt on supported browsers
- [ ] App icon on home screen
- [ ] Splash screen on launch
- [ ] Works in standalone mode

**Technical Notes**:
- Add manifest.json with icons
- Service worker for offline support
- Already using Vite PWA plugin

---

### 22. Native Mobile App (React Native)
**Type**: Feature | **Effort**: Extra Large | **Labels**: `mobile`, `future`

**Description**: Build native iOS and Android apps for better performance and native features.

**Acceptance Criteria**:
- [ ] React Native app with shared business logic
- [ ] Native navigation and gestures
- [ ] Push notifications
- [ ] HealthKit/Google Fit integration
- [ ] App Store/Play Store distribution

**Technical Notes**:
- Consider after web app is stable
- Expo for faster development
- Share types and API layer with web

---

### 23. Apple Watch / WearOS Companion
**Type**: Feature | **Effort**: Extra Large | **Labels**: `wearable`, `future`

**Description**: Companion app for smartwatches to log sets without pulling out phone.

**Acceptance Criteria**:
- [ ] View current exercise on watch
- [ ] Tap to complete set
- [ ] Rest timer on watch
- [ ] Sync with phone app
- [ ] Heart rate integration

**Technical Notes**:
- Requires native development
- Mark as future/v2+

---

## 🎨 UI/UX Enhancements

### 24. Dark Mode
**Type**: Feature | **Effort**: Small | **Labels**: `ui`, `accessibility`

**Description**: Add dark color scheme option for comfortable viewing in low light.

**Acceptance Criteria**:
- [ ] Dark theme following design system
- [ ] Toggle in settings
- [ ] Respect system preference
- [ ] Smooth transition between modes
- [ ] All components styled for dark mode

**Technical Notes**:
- Tailwind dark mode classes
- CSS variables for theme colors
- next-themes already in dependencies

---

### 25. Onboarding Flow
**Type**: Feature | **Effort**: Medium | **Labels**: `ux`, `onboarding`

**Description**: Guided onboarding for new users to set up their first workout plan and understand app features.

**Acceptance Criteria**:
- [ ] Welcome screen with value proposition
- [ ] Quick setup wizard (goals, experience level)
- [ ] Guided first workout plan creation
- [ ] Feature highlights/tooltips
- [ ] Skip option for experienced users

**Technical Notes**:
- Track onboarding completion in user data
- Use Coach marks or tooltip library

---

### 26. Haptic Feedback on Mobile
**Type**: Feature | **Effort**: Small | **Labels**: `mobile`, `ux`

**Description**: Add haptic feedback (vibration) for key interactions on mobile devices.

**Acceptance Criteria**:
- [ ] Vibrate on set completion
- [ ] Vibrate on timer end
- [ ] Subtle feedback on button presses
- [ ] Configurable in settings
- [ ] Respect system haptic settings

**Technical Notes**:
- Navigator.vibrate() API
- Pattern-based vibration for different events

---

## 📋 Backlog Summary

| Priority | Category | Count |
|----------|----------|-------|
| High | Core Features | 5 |
| Medium | Progress & Analytics | 3 |
| Medium | Workout Experience | 4 |
| Medium | AI & Smart Features | 3 |
| Medium | Technical | 5 |
| Low | Platform & Distribution | 3 |
| Low | UI/UX | 3 |
| **Total** | | **26** |

---

## How to Use This Backlog

1. **Prioritization**: Review with stakeholders to assign priority (P0-P3)
2. **Estimation**: Refine effort estimates during sprint planning
3. **Detailed Plans**: Create detailed implementation plans in separate files
4. **GitHub Issues**: Convert items to GitHub Issues for tracking
5. **Iteration**: Update backlog as features ship and new ideas emerge

---

*This backlog is a living document. Update as the product evolves.*
