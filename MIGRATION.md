# Migration Guide: GitHub Spark to Lightweight Backend

## Summary of Changes

FitTrack has transitioned from **GitHub Spark KV storage** to a **lightweight Express backend** with JSON file persistence. This enables the application to run outside the GitHub Spark environment.

## What Changed for Developers

### 1. Import Changes

**Before (GitHub Spark):**
```tsx
import { useKV } from '@github/spark/hooks';

const [plans, setPlans] = useKV<WorkoutPlan[]>('workout-plans', []);
```

**After (New Backend):**
```tsx
import { usePersistentState } from '@/hooks/use-persistent-state';

const [plans, setPlans] = usePersistentState<WorkoutPlan[]>('workout-plans', []);
```

### 2. No Component Logic Changes

The hook interface is identical—existing code works without changes:

```tsx
// This pattern works the same way
setPlans((current) => [...current, newPlan]);  // Automatically persisted
```

### 3. Development Workflow

**Before:**
```bash
npm run dev  # Ran Vite dev server only
```

**After:**
```bash
npm run dev  # Runs backend + frontend concurrently
```

Both servers are now started automatically:
- **Backend**: http://localhost:3000 (Express, data persistence)
- **Frontend**: http://localhost:5173 (Vite, UI)

## Files Added/Modified

### New Files
- `server.ts` - Express backend server
- `src/lib/api.ts` - Fetch-based API client
- `src/hooks/use-persistent-state.ts` - Replacement for `useKV`
- `BACKEND.md` - Backend architecture documentation
- `.env.development` - Development configuration
- `.env.production` - Production configuration

### Modified Files
- `src/components/PlansView.tsx` - Changed import from `useKV` to `usePersistentState`
- `src/components/WorkoutView.tsx` - Changed import from `useKV` to `usePersistentState`
- `src/components/ProgressView.tsx` - Changed import from `useKV` to `usePersistentState`
- `package.json` - Added backend dependencies (express, cors, ts-node, concurrently, etc.)
- `.github/copilot-instructions.md` - Updated architecture documentation
- `.gitignore` - Added `.data/` directory

### Files Removed
- GitHub Spark dependencies usage (kept `@github/spark` in package.json for spark plugin, but removed `useKV` imports)

## Data Persistence Model

### Before (GitHub Spark)
- Data stored in browser using GitHub Spark's encrypted KV storage
- Not accessible outside GitHub Spark environment
- Single-user (per browser)

### After (Express Backend)
- Data stored in `.data/` directory as JSON files (local development)
- Can be easily migrated to any backend (Firebase, Supabase, etc.)
- Supports multiple users with authentication layer (future enhancement)
- Human-readable JSON files for easy debugging

## Benefits

✅ **Works outside GitHub Spark** - Run anywhere Node.js is available  
✅ **Scalable architecture** - Replace JSON files with cloud databases  
✅ **Drop-in replacement** - Components need minimal changes  
✅ **Clear separation** - API layer decoupled from UI logic  
✅ **Better testing** - Can test API independently from React components  

## Troubleshooting

### Port already in use
```bash
# Kill processes on ports 3000 and 5173
lsof -i :3000
lsof -i :5173
kill -9 <PID>
```

### Backend won't start
```bash
# Check Node version
node --version  # Should be 16+

# Try starting backend directly
npm run dev:backend

# Check for errors
echo $?
```

### Data not persisting
1. Verify `.data/` directory exists
2. Check file permissions: `ls -la .data/`
3. Verify API responses show `"success": true`
4. Check browser console for CORS or fetch errors

## Next Steps

1. ✅ **Verified** - Backend successfully replaces GitHub Spark KV
2. 📝 **Ready** - All components updated to use new hook
3. 🚀 **Next** - Deploy backend to cloud platform
4. 🔐 **Future** - Add authentication/authorization
5. 💾 **Future** - Migrate to production database (PostgreSQL, Firebase, etc.)

## Questions?

Refer to `BACKEND.md` for detailed backend architecture documentation.
