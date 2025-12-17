# Security Implementation Guide - Code Examples

This document provides code examples for implementing the critical and high-priority security fixes.

---

## 1. Fix Hard-coded JWT Secret

### Current (Vulnerable)
```typescript
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';
```

### Recommended Fix
```typescript
import { randomBytes } from 'crypto';

// Require JWT_SECRET or generate for development only
const getJWTSecret = (): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'FATAL: JWT_SECRET environment variable is required in production. ' +
        'Set it to a random 32+ character string.'
      );
    }
    // Development only: generate temporary secret
    console.warn('⚠️  WARNING: Using development JWT secret. Set JWT_SECRET env var for production.');
    return randomBytes(32).toString('hex');
  }

  // Validate secret length in production
  if (process.env.NODE_ENV === 'production' && secret.length < 32) {
    throw new Error(
      `FATAL: JWT_SECRET must be at least 32 characters. Current length: ${secret.length}`
    );
  }

  return secret;
};

const JWT_SECRET = getJWTSecret();
```

### In `.env.production`
```
JWT_SECRET=your-secure-random-32-character-string-here
```

### Testing
```typescript
describe('JWT Secret Validation', () => {
  it('should throw error when JWT_SECRET not set in production', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.JWT_SECRET;
    expect(() => getJWTSecret()).toThrow('JWT_SECRET environment variable is required');
  });

  it('should throw error when JWT_SECRET too short in production', () => {
    process.env.NODE_ENV = 'production';
    process.env.JWT_SECRET = 'short';
    expect(() => getJWTSecret()).toThrow('must be at least 32 characters');
  });

  it('should generate secret in development when not set', () => {
    process.env.NODE_ENV = 'development';
    delete process.env.JWT_SECRET;
    const secret = getJWTSecret();
    expect(secret).toHaveLength(64); // 32 bytes = 64 hex characters
  });
});
```

---

## 2. Add Rate Limiting

### Installation
```bash
npm install express-rate-limit
npm install --save-dev @types/express-rate-limit
```

### Implementation
```typescript
import rateLimit from 'express-rate-limit';

// Separate limiters for different endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true, // Include RateLimit-* headers
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/api/health';
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many requests, please try again later',
      retryAfter: req.rateLimit.resetTime,
    });
  },
});

const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 requests
  message: 'Too many signup attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply limiters to auth endpoints
app.post('/api/auth/login', authLimiter, async (req, res) => {
  // existing code
});

app.post('/api/auth/signup', signupLimiter, async (req, res) => {
  // existing code
});

// Optional: Store for memory or Redis
// const RedisStore = require('rate-limit-redis');
// const redis = require('redis');
// const client = redis.createClient();
// const limiter = rateLimit({
//   store: new RedisStore({
//     client: client,
//     prefix: 'rl:',
//   }),
//   windowMs: 15 * 60 * 1000,
//   max: 5,
// });
```

### Configuration via Environment
```typescript
// .env file
RATE_LIMIT_WINDOW_MS=900000        # 15 minutes
RATE_LIMIT_MAX_ATTEMPTS=5
RATE_LIMIT_SIGNUP_MAX=3
RATE_LIMIT_SIGNUP_WINDOW_MS=3600000 # 1 hour
```

### Testing
```typescript
describe('Rate Limiting', () => {
  it('should block requests after limit exceeded', async () => {
    const requests = [];
    for (let i = 0; i < 6; i++) {
      requests.push(
        fetch('http://localhost:3000/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: 'test@test.com', password: 'password' }),
        })
      );
    }
    const responses = await Promise.all(requests);
    expect(responses[5].status).toBe(429);
  });

  it('should include Retry-After header', async () => {
    // Make 5 requests
    for (let i = 0; i < 5; i++) {
      await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@test.com', password: 'password' }),
      });
    }
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@test.com', password: 'password' }),
    });
    expect(response.headers.get('Retry-After')).toBeDefined();
  });
});
```

---

## 3. Improve Password Validation

### Installation
```bash
npm install zxcvbn
npm install --save-dev @types/zxcvbn
```

### Implementation
```typescript
import zxcvbn from 'zxcvbn';

interface PasswordValidationResult {
  valid: boolean;
  score: number; // 0-4
  feedback: string[];
  suggestions: string[];
}

export function validatePassword(password: string, userInputs: string[] = []): PasswordValidationResult {
  // Check minimum length
  if (password.length < 12) {
    return {
      valid: false,
      score: 0,
      feedback: ['Password must be at least 12 characters long'],
      suggestions: ['Add more characters to your password'],
    };
  }

  // Check for required character types
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const feedback = [];
  if (!hasUppercase) feedback.push('Add uppercase letters (A-Z)');
  if (!hasLowercase) feedback.push('Add lowercase letters (a-z)');
  if (!hasNumbers) feedback.push('Add numbers (0-9)');
  if (!hasSpecialChars) feedback.push('Add special characters (!@#$%^&*)');

  if (feedback.length > 0) {
    return {
      valid: false,
      score: 0,
      feedback,
      suggestions: feedback,
    };
  }

  // Use zxcvbn for strength estimation
  const result = zxcvbn(password, userInputs);

  // Require score of at least 3 (strong)
  if (result.score < 3) {
    return {
      valid: false,
      score: result.score,
      feedback: ['Password is too weak, even with all required character types'],
      suggestions: result.feedback.suggestions || [],
    };
  }

  return {
    valid: true,
    score: result.score,
    feedback: ['Password is strong'],
    suggestions: [],
  };
}

// Usage in signup endpoint
app.post('/api/auth/signup', async (req, res) => {
  const { email, password, name } = req.body;

  // Validate password
  const passwordValidation = validatePassword(password, [email, name]);
  if (!passwordValidation.valid) {
    return res.status(400).json({
      success: false,
      error: 'Password does not meet requirements',
      feedback: passwordValidation.feedback,
    });
  }

  // ... rest of signup logic
});
```

### Frontend - Password Strength Meter
```tsx
import React, { useState } from 'react';
import zxcvbn from 'zxcvbn';

export function PasswordStrengthMeter({ password, email, name }: { password: string; email: string; name: string }) {
  const [result, setResult] = useState(null);

  React.useEffect(() => {
    if (!password) {
      setResult(null);
      return;
    }

    const result = zxcvbn(password, [email, name]);
    setResult(result);
  }, [password, email, name]);

  if (!result) return null;

  const scoreLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const scoreColors = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'];

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium">Password Strength</label>
        <span className="text-sm font-semibold">{scoreLabels[result.score]}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="h-2 rounded-full transition-all"
          style={{
            width: `${((result.score + 1) / 5) * 100}%`,
            backgroundColor: scoreColors[result.score],
          }}
        />
      </div>
      {result.feedback.suggestions.length > 0 && (
        <ul className="text-xs text-gray-600 space-y-1">
          {result.feedback.suggestions.map((suggestion, i) => (
            <li key={i}>• {suggestion}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

## 4. Add Helmet Security Headers

### Installation
```bash
npm install helmet
npm install --save-dev @types/helmet
```

### Implementation
```typescript
import helmet from 'helmet';

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"], // Adjust based on your needs
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'http://localhost:3000', 'http://localhost:5173'],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: true,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    dnsPrefetchControl: true,
    frameguard: { action: 'deny' },
    hidePoweredBy: true,
    hsts: {
      maxAge: 31536000, // 1 year in seconds
      includeSubDomains: true,
      preload: true,
    },
    ieNoOpen: true,
    noSniff: true,
    permittedCrossDomainPolicies: false,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xssFilter: true,
  })
);
```

### Testing
```typescript
describe('Security Headers', () => {
  it('should include X-Frame-Options header', async () => {
    const response = await fetch('http://localhost:3000/api/health');
    expect(response.headers.get('X-Frame-Options')).toBe('DENY');
  });

  it('should include X-Content-Type-Options header', async () => {
    const response = await fetch('http://localhost:3000/api/health');
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
  });

  it('should include HSTS header', async () => {
    const response = await fetch('http://localhost:3000/api/health');
    expect(response.headers.get('Strict-Transport-Security')).toContain('max-age=31536000');
  });

  it('should include CSP header', async () => {
    const response = await fetch('http://localhost:3000/api/health');
    expect(response.headers.get('Content-Security-Policy')).toBeDefined();
  });
});
```

---

## 5. Add CSRF Protection

### Installation
```bash
npm install csurf cookie-parser
npm install --save-dev @types/csurf
```

### Implementation
```typescript
import csurf from 'csurf';
import cookieParser from 'cookie-parser';

// Middleware must come after cookie-parser
app.use(cookieParser());

// CSRF protection middleware
const csrfProtection = csurf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict',
  },
});

// GET endpoint to retrieve CSRF token for forms
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Apply CSRF protection to all state-changing requests
app.put('/api/data/:key', csrfProtection, verifyToken, (req, res) => {
  // Token is automatically validated
  // ... rest of endpoint
});

app.post('/api/auth/signup', csrfProtection, async (req, res) => {
  // Token is automatically validated
  // ... rest of endpoint
});

app.delete('/api/data/:key', csrfProtection, verifyToken, (req, res) => {
  // Token is automatically validated
  // ... rest of endpoint
});

// Error handler for CSRF failures
app.use((err: any, req: any, res: any, next: any) => {
  if (err.code !== 'EBADCSRFTOKEN') return next(err);
  res.status(403).json({
    success: false,
    error: 'Invalid CSRF token',
  });
});
```

### Frontend - Get and Send CSRF Token
```tsx
import React, { useEffect, useState } from 'react';

export function useCSRFToken() {
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/csrf-token');
        const data = await response.json();
        setToken(data.csrfToken);
      } catch (error) {
        console.error('Failed to fetch CSRF token:', error);
      }
    };

    fetchToken();
  }, []);

  return token;
}

// Usage in a form
export function SaveDataForm() {
  const csrfToken = useCSRFToken();

  const handleSave = async (data: unknown) => {
    const response = await fetch('http://localhost:3000/api/data/my-key', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({ data }),
    });

    if (!response.ok) {
      throw new Error('Failed to save data');
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSave({ /* form data */ });
    }}>
      {/* form fields */}
    </form>
  );
}
```

---

## 6. Protect Export/Import Endpoints

### Implementation
```typescript
// Require authentication on export
app.post('/api/export', verifyToken, (req, res) => {
  // Optional: Check for admin role
  // if (!isAdmin(req.userId)) {
  //   return res.status(403).json({ success: false, error: 'Forbidden' });
  // }

  try {
    const userId = req.userId;
    const prefix = `user-${userId}-`;
    const files = readdirSync(dataDir);

    const exportData: Record<string, unknown> = {};

    files.forEach((file) => {
      if (file.endsWith('.json') && file.startsWith(prefix)) {
        const key = file.replace('.json', '').replace(prefix, '');
        const content = JSON.parse(readFileSync(join(dataDir, file), 'utf-8'));
        exportData[key] = content;
      }
    });

    // Log export for audit trail
    console.log(`[AUDIT] User ${userId} exported data at ${new Date().toISOString()}`);

    res.json({
      success: true,
      data: exportData,
      exportedAt: new Date().toISOString(),
      count: Object.keys(exportData).length,
    });
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Require authentication and validate schema on import
import { z } from 'zod';

const ImportSchema = z.record(z.unknown());
const MAX_IMPORT_SIZE = 10 * 1024 * 1024; // 10MB

app.post('/api/import', verifyToken, (req, res) => {
  const { data } = req.body;
  const userId = req.userId;

  // Validate data exists and is object
  if (!data || typeof data !== 'object') {
    return res.status(400).json({
      success: false,
      error: 'Invalid data format. Expected object.',
    });
  }

  // Validate size
  const dataSize = JSON.stringify(data).length;
  if (dataSize > MAX_IMPORT_SIZE) {
    return res.status(413).json({
      success: false,
      error: `Import too large. Maximum size is ${MAX_IMPORT_SIZE} bytes.`,
    });
  }

  // Validate schema
  try {
    ImportSchema.parse(data);
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: 'Invalid data structure',
      details: error instanceof z.ZodError ? error.errors : [],
    });
  }

  try {
    let importedCount = 0;

    Object.entries(data).forEach(([key, value]) => {
      // Scope key by user ID
      const scopedKey = `user-${userId}-${key}`;
      const filePath = getKeyPath(scopedKey);
      const dir = dirname(filePath);

      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }

      writeFileSync(filePath, JSON.stringify(value, null, 2), 'utf-8');
      importedCount++;
    });

    // Log import for audit trail
    console.log(
      `[AUDIT] User ${userId} imported ${importedCount} keys at ${new Date().toISOString()}`
    );

    res.json({
      success: true,
      imported: importedCount,
      importedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error importing data:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});
```

---

## 7. Move Tokens to Secure Cookies

### Server-side: Set token in cookie
```typescript
app.post('/api/auth/login', authLimiter, async (req, res) => {
  const { email, password } = req.body;

  // ... validation and password verification ...

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
    expiresIn: '15m', // Short-lived access token
  });

  // Set token in httpOnly, Secure cookie
  res.cookie('accessToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS only
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  // Also return refresh token in cookie
  const refreshToken = jwt.sign({ userId: user.id }, JWT_SECRET, {
    expiresIn: '7d',
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/api/auth/refresh', // Only sent to refresh endpoint
  });

  res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    // Don't return token - it's in the cookie
  });
});

// Refresh token endpoint
app.post('/api/auth/refresh', (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      error: 'Refresh token missing',
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET) as any;

    const newAccessToken = jwt.sign({ userId: decoded.userId }, JWT_SECRET, {
      expiresIn: '15m',
    });

    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    res.json({ success: true, message: 'Token refreshed' });
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid refresh token',
    });
  }
});
```

### Client-side: Automatic cookie handling
```typescript
// api.ts - Fetch will automatically include httpOnly cookies
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export async function apiGet<T>(key: string): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/data/${key}`, {
      credentials: 'include', // Include cookies in request
    });
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    return data.data as T;
  } catch (error) {
    console.error(`Failed to fetch ${key}:`, error);
    throw error;
  }
}

// Auth Context - No need to store token, it's in cookies
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserPublic | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        // Verify token from cookie
        const response = await fetch(`${API_BASE}/auth/verify`, {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error('Session restore failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  // ... rest of implementation
}
```

---

## Implementation Checklist

- [ ] JWT secret enforcement (1)
- [ ] Rate limiting (2)
- [ ] Password validation (3)
- [ ] Security headers (4)
- [ ] CSRF protection (5)
- [ ] Protected export/import (6)
- [ ] Tokens in cookies (7)
- [ ] Add tests for each fix
- [ ] Update API documentation
- [ ] Deploy to staging
- [ ] Security testing on staging
- [ ] Deploy to production

---

**Note**: These are starting examples. Customize based on your specific security requirements and business logic.
