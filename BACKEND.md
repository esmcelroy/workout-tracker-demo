# Backend Architecture Guide

## Overview

FitTrack now uses a lightweight Express backend that handles data persistence via JSON files. This design allows you to:

- **Run the application outside the GitHub Spark environment**
- **Migrate to cloud backends** (Firebase, Supabase, etc.) without changing component code
- **Scale incrementally** from JSON files to databases as needed

## Architecture

### Three-Layer Design

```
┌─────────────────────────────────────────┐
│  React Components                       │
│  (PlansView, WorkoutView, etc.)         │
└────────────────┬────────────────────────┘
                 │
                 │ usePersistentState hook
                 ▼
┌─────────────────────────────────────────┐
│  API Service Layer (src/lib/api.ts)     │
│  - apiGet(), apiSet(), apiDelete()      │
│  - fetch-based HTTP client              │
└────────────────┬────────────────────────┘
                 │
                 │ fetch() via HTTP
                 ▼
┌─────────────────────────────────────────┐
│  Express Backend (server.ts)            │
│  - REST endpoints for CRUD              │
│  - JSON file persistence (.data/)       │
│  - CORS & error handling                │
└─────────────────────────────────────────┘
```

## Components

### 1. usePersistentState Hook (`src/hooks/use-persistent-state.ts`)

Replaces GitHub Spark's `useKV` with a custom hook that communicates with the backend.

**Interface remains identical for drop-in replacement:**
```tsx
const [data, setData] = usePersistentState<T>(key, defaultValue);
```

**Features:**
- Automatic persistence on state change
- Fallback to default value on API errors
- Optional debouncing for frequent updates
- LocalStorage fallback for offline resilience

**Key implementation details:**
- Uses `apiSet()` to persist changes to backend
- Loads initial data with `apiGet()` on mount
- Handles updater functions: `setData((current) => ...)`

### 2. API Service Layer (`src/lib/api.ts`)

Generic fetch-based client for backend communication.

**Available functions:**
```typescript
// Retrieve data for a key
const data = await apiGet<WorkoutPlan[]>('workout-plans');

// Store/update data
const result = await apiSet('workout-plans', newPlans);

// Delete a key
await apiDelete('active-session');

// List all keys
const keys = await apiListKeys();
```

**Environment configuration:**
- `VITE_API_URL` environment variable controls backend URL
- Development: `http://localhost:3000/api` (`.env.development`)
- Production: `/api` (`.env.production`) - assumes backend is same domain

**Error handling:**
- 404 responses return `null` instead of throwing
- Other errors log to console but don't break the UI
- Components continue with default values on API failures

### 3. Express Backend (`server.ts`)

Lightweight HTTP server handling data persistence.

**Key features:**
- **CORS enabled** for requests from Vite dev server (localhost:5173)
- **Atomic writes** using temp files + rename to prevent corruption
- **Key sanitization** to prevent directory traversal attacks
- **JSON formatting** for human-readable data files

**Storage model:**
- Each key is stored as a separate JSON file in `.data/` directory
- Filenames are sanitized versions of keys (special chars → underscores)
- Directory is created automatically on first run
- Added to `.gitignore` by default (local development only)

### REST API Endpoints

#### GET `/api/data/:key`
Retrieve data for a specific key.

```bash
curl http://localhost:3000/api/data/workout-plans
```

**Responses:**
- `200 OK`: `{ "success": true, "data": [...] }`
- `404 Not Found`: `{ "success": false, "error": "Key not found" }`
- `500 Server Error`: `{ "success": false, "error": "Internal server error" }`

#### PUT `/api/data/:key`
Store or update data for a key.

```bash
curl -X PUT http://localhost:3000/api/data/workout-plans \
  -H "Content-Type: application/json" \
  -d '{"data": [...]}'
```

**Request body:**
```json
{
  "data": <any JSON-serializable value>
}
```

**Responses:**
- `200 OK`: `{ "success": true, "data": [...] }`
- `400 Bad Request`: Missing or invalid data field
- `500 Server Error`: File write failed

#### DELETE `/api/data/:key`
Delete data for a key.

```bash
curl -X DELETE http://localhost:3000/api/data/active-session
```

**Responses:**
- `200 OK`: `{ "success": true }`
- `500 Server Error`: `{ "success": false, "error": "Internal server error" }`

#### GET `/api/keys`
List all stored keys.

```bash
curl http://localhost:3000/api/keys
```

**Response:**
```json
{
  "success": true,
  "keys": ["workout-plans", "workout-sessions", "active-session"]
}
```

#### GET `/api/health`
Health check endpoint.

```bash
curl http://localhost:3000/api/health
```

**Response:**
```json
{
  "success": true,
  "message": "Backend is running"
}
```

#### POST `/api/export`
Export all data as JSON (useful for backups).

```bash
curl -X POST http://localhost:3000/api/export
```

**Response:**
```json
{
  "success": true,
  "data": {
    "workout-plans": [...],
    "workout-sessions": [...],
    ...
  }
}
```

#### POST `/api/import`
Import data from JSON (useful for restores).

```bash
curl -X POST http://localhost:3000/api/import \
  -H "Content-Type: application/json" \
  -d '{"data": {"workout-plans": [...], ...}}'
```

**Response:**
```json
{
  "success": true,
  "imported": 3
}
```

## Development & Deployment

### Local Development

Run both backend and frontend with one command:
```bash
npm run dev
```

This starts:
- **Backend**: Express server on http://localhost:3000
- **Frontend**: Vite dev server on http://localhost:5173

### Individual Servers

```bash
npm run dev:backend    # Backend only
npm run dev:frontend   # Frontend only
```

### Environment Configuration

**`.env.development`** (local development):
```
VITE_API_URL=http://localhost:3000/api
```

**`.env.production`** (production deployment):
```
VITE_API_URL=/api
```

For custom deployment, set `VITE_API_URL` to your backend URL.

### Build for Production

```bash
npm run build
```

This creates a `dist/` folder with optimized frontend code. Backend must be deployed separately.

## Migrating to Cloud Backends

The architecture is designed for easy backend swapping. To migrate to Firebase, Supabase, or other services:

1. **Replace API functions** in `src/lib/api.ts`:
   ```typescript
   export async function apiGet<T>(key: string): Promise<T | null> {
     // Call your cloud backend instead of local Express
     const response = await firebase.collection('data').doc(key).get();
     return response.data();
   }
   ```

2. **Components remain unchanged** - they still use `usePersistentState()` the same way

3. **Type definitions stay identical** - no need to refactor components

This makes it safe to start with JSON files and scale to a robust cloud backend as your application grows.

## Data Schema

FitTrack stores three main data types:

### `workout-plans` (WorkoutPlan[])
```typescript
{
  id: string;
  name: string;
  description: string;
  exercises: WorkoutExercise[];
  createdAt: number;
}
```

### `workout-sessions` (WorkoutSession[])
```typescript
{
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
```

### `active-session` (WorkoutSession | null)
The current workout in progress, if any.

## Performance Considerations

### Current (JSON Files)
- Suitable for personal use or small deployments
- ~100ms latency per request (local filesystem)
- No scalability concerns for single-user scenarios
- Easy debugging (inspect `.data/` directory)

### Future (Cloud Databases)
- Consider indexing on `planId`, `status`, `startedAt`
- Implement pagination for `workout-sessions` history
- Add database transactions if needed (rarely needed for this schema)
- Monitor cold-start latencies for cloud functions

## Troubleshooting

### Backend won't start
```bash
# Check if port 3000 is in use
lsof -i :3000

# Kill any process on port 3000
kill -9 <PID>

# Or change port
PORT=4000 npm run backend
```

### Data not persisting
- Check `.data/` directory exists and is writable
- Verify API responses return `success: true`
- Check browser console for API errors
- Ensure `VITE_API_URL` is set correctly

### CORS errors
- Backend should automatically allow localhost:5173
- For other origins, update CORS config in `server.ts`:
  ```typescript
  app.use(cors({
    origin: ['http://localhost:5173', 'https://yourdomain.com']
  }));
  ```

## Security Notes

⚠️ **This backend is for development/personal use only.**

For production, add:
- **Authentication** - Verify users can only access their data
- **Input validation** - Validate all user inputs
- **Rate limiting** - Prevent abuse
- **HTTPS** - Encrypt data in transit
- **Database** - Replace JSON files with a real database
- **Audit logging** - Track data changes

The current implementation is optimized for rapid development and educational purposes.
