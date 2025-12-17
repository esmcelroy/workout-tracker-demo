# GitHub Security Enhancement Issues

These are pre-formatted GitHub issues ready to publish. Each can be posted directly to the GitHub repository's Issues tab.

---

## CRITICAL PRIORITY ISSUES

### Issue #1: Hard-coded JWT Secret in Production

**Title**: 🔴 CRITICAL: Hard-coded JWT Secret Allows Token Forgery

**Labels**: `security`, `critical`, `authentication`

**Description**:

## Problem
The JWT secret defaults to a hardcoded string if the `JWT_SECRET` environment variable is not set. This creates a critical vulnerability where tokens can be forged by anyone with knowledge of the default secret.

**Current Code**:
```typescript
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';
```

## Impact
- Attackers can forge valid JWT tokens
- Compromised tokens remain valid for 7 days
- Authentication can be completely bypassed
- User data can be accessed and modified by unauthorized parties

## Solution
1. Make `JWT_SECRET` required - throw error at startup if not set
2. Generate random 32+ character secret for development
3. Validate secret length (minimum 32 characters) in production
4. Document JWT_SECRET requirement in deployment guide
5. Implement secret rotation mechanism

## Acceptance Criteria
- [ ] Application fails fast at startup if JWT_SECRET not configured
- [ ] Error message provides clear guidance
- [ ] Development default is strong random secret
- [ ] Documentation updated
- [ ] Tests verify behavior

**Priority**: CRITICAL  
**Effort**: 2-4 hours

---

### Issue #2: No Rate Limiting on Authentication Endpoints

**Title**: 🔴 CRITICAL: Missing Rate Limiting Enables Brute Force Attacks

**Labels**: `security`, `critical`, `authentication`, `rate-limiting`

**Description**:

## Problem
Authentication endpoints (`/api/auth/login`, `/api/auth/signup`) have no rate limiting, allowing unlimited login/signup attempts.

## Impact
- Brute force attacks on user accounts
- Credential stuffing attacks
- DoS attacks on authentication service
- Weak passwords can be guessed quickly

## Solution
Implement rate limiting middleware:
1. Use `express-rate-limit` package
2. Limit login to 5 attempts per 15 minutes per IP
3. Limit signup to 3 attempts per 60 minutes per IP
4. Return HTTP 429 with `Retry-After` header
5. Log rate limit violations

## Implementation Example
```typescript
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts',
  standardHeaders: true,
  legacyHeaders: false,
});

app.post('/api/auth/login', loginLimiter, async (req, res) => {
  // existing code
});
```

## Acceptance Criteria
- [ ] Rate limit middleware installed and configured
- [ ] Login limited to 5/15min per IP
- [ ] Signup limited to 3/60min per IP
- [ ] HTTP 429 responses sent with Retry-After
- [ ] Rate limits configurable via environment
- [ ] Tests verify limiting works
- [ ] Tests verify legitimate users can retry after limit

**Priority**: CRITICAL  
**Effort**: 2-3 hours

---

### Issue #3: Weak Password Validation

**Title**: 🔴 CRITICAL: 6-Character Password Requirement is Too Weak

**Labels**: `security`, `critical`, `authentication`, `validation`

**Description**:

## Problem
Current password policy requires only 6 characters with no complexity requirements.

```typescript
if (password.length < 6) {
  return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
}
```

## Impact
- Passwords vulnerable to brute force
- No enforcement of password complexity
- Weak passwords easily guessed
- Non-compliance with security standards

## Solution
1. Increase minimum to 12 characters
2. Require uppercase, lowercase, numbers, and symbols
3. Use `zxcvbn` for password strength estimation
4. Reject common/dictionary passwords
5. Provide strength feedback on frontend

## Implementation Example
```typescript
import zxcvbn from 'zxcvbn';

function validatePassword(password: string): { valid: boolean; feedback: string } {
  if (password.length < 12) return { valid: false, feedback: 'Minimum 12 characters required' };
  
  const result = zxcvbn(password);
  if (result.score < 3) return { valid: false, feedback: 'Password too weak' };
  
  return { valid: true, feedback: 'Strong password' };
}
```

## Acceptance Criteria
- [ ] Minimum 12 character requirement
- [ ] Complexity validation implemented
- [ ] Password strength feedback provided
- [ ] Common passwords rejected
- [ ] Frontend shows strength meter
- [ ] Tests cover all validation cases
- [ ] Error messages clear and helpful

**Priority**: CRITICAL  
**Effort**: 3-4 hours

---

### Issue #4: Missing CSRF Protection

**Title**: 🔴 CRITICAL: No CSRF Token Protection on State-Changing Operations

**Labels**: `security`, `critical`, `csrf-protection`, `middleware`

**Description**:

## Problem
State-changing endpoints (POST, PUT, DELETE) have no CSRF token validation, making them vulnerable to Cross-Site Request Forgery attacks.

## Impact
- Attackers can perform unauthorized actions on behalf of authenticated users
- Account takeover possible through forged requests
- Data manipulation without user knowledge
- Financial/health implications for workout data

## Solution
1. Install `csurf` middleware
2. Generate CSRF tokens for all forms
3. Validate tokens on all state-changing requests
4. Use SameSite cookie attribute
5. Include tokens in request headers or form fields

## Implementation Example
```typescript
import csurf from 'csurf';

const csrfProtection = csurf({ cookie: false });

app.post('/api/data/:key', csrfProtection, verifyToken, (req, res) => {
  // token validated automatically
});
```

## Acceptance Criteria
- [ ] CSRF middleware integrated
- [ ] Tokens generated and validated
- [ ] All forms include CSRF tokens
- [ ] SameSite=Strict on cookies
- [ ] E2E tests verify CSRF protection
- [ ] Documentation updated

**Priority**: CRITICAL  
**Effort**: 4-5 hours

---

### Issue #5: Unprotected Export/Import Endpoints

**Title**: 🔴 CRITICAL: Export/Import Endpoints Lack Authentication

**Labels**: `security`, `critical`, `authorization`, `data-exposure`

**Description**:

## Problem
The `/api/export` and `/api/import` endpoints have no authentication or authorization checks, allowing anyone to export all user data or import malicious data.

```typescript
app.post('/api/export', (req, res) => {  // NO verifyToken!
  // exports ALL user data without auth
});
```

## Impact
- Complete data breach - all user data accessible
- Data integrity compromise through malicious imports
- No audit trail of who accessed data
- GDPR/compliance violations

## Solution
1. Add `verifyToken` middleware to both endpoints
2. Implement admin-only authorization
3. Validate imported data against schema
4. Enforce size limits on imports
5. Log all import/export operations

## Acceptance Criteria
- [ ] Both endpoints require authentication
- [ ] Both endpoints require admin role
- [ ] Import data validated against schema
- [ ] Size limit enforced (max 10MB)
- [ ] All operations logged with timestamp/user
- [ ] Tests verify protection works
- [ ] Tests verify data integrity

**Priority**: CRITICAL  
**Effort**: 2-3 hours

---

## HIGH PRIORITY ISSUES

### Issue #6: Missing Helmet Security Headers

**Title**: 🟠 HIGH: Missing Security Headers (Helmet.js)

**Labels**: `security`, `high`, `headers`, `http`

**Description**:

## Problem
Application doesn't set critical security headers that prevent common attacks.

## Impact
- Clickjacking attacks possible (no X-Frame-Options)
- MIME-type sniffing attacks
- Missing XSS protections
- Missing HSTS for HTTPS

## Solution
Implement Helmet.js middleware to set:
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Content-Security-Policy
- Strict-Transport-Security
- X-XSS-Protection

## Acceptance Criteria
- [ ] Helmet installed and configured
- [ ] All recommended headers present
- [ ] CSP policy configured
- [ ] Tests verify headers present

**Priority**: HIGH  
**Effort**: 2 hours

---

### Issue #7: Insufficient Input Validation

**Title**: 🟠 HIGH: Missing Schema Validation on API Endpoints

**Labels**: `security`, `high`, `validation`, `input-handling`

**Description**:

## Problem
API endpoints accept input without schema validation, risking injection attacks and data corruption.

## Solution
1. Use Zod for schema validation
2. Validate all request bodies
3. Validate query parameters
4. Enforce field size limits
5. Provide clear validation errors

## Acceptance Criteria
- [ ] Schema validation on all endpoints
- [ ] Clear error messages
- [ ] Field size limits enforced
- [ ] Test coverage for validation

**Priority**: HIGH  
**Effort**: 4-5 hours

---

### Issue #8: No HTTPS Enforcement in Production

**Title**: 🟠 HIGH: HTTPS Not Enforced - Credentials Transmitted Insecurely

**Labels**: `security`, `high`, `https`, `encryption`

**Description**:

## Problem
Application doesn't enforce HTTPS, allowing credentials to be transmitted over unencrypted connections.

## Solution
1. Add HTTPS redirect middleware for production
2. Enable HSTS header
3. Set HSTS max-age to 1 year
4. Configure certificate management
5. Document deployment requirements

## Acceptance Criteria
- [ ] HTTP requests redirect to HTTPS in production
- [ ] HSTS header configured
- [ ] Environment-specific configuration
- [ ] Documentation updated

**Priority**: HIGH  
**Effort**: 2-3 hours

---

### Issue #9: No Token Refresh Mechanism

**Title**: 🟠 HIGH: 7-Day Token Expiration Lacks Refresh Mechanism

**Labels**: `security`, `high`, `authentication`, `tokens`

**Description**:

## Problem
Tokens are issued with 7-day expiration but no refresh mechanism. Compromised tokens remain valid for extended period.

## Solution
1. Issue short-lived access tokens (15 minutes)
2. Implement refresh token mechanism
3. Store refresh tokens in httpOnly cookies
4. Implement token revocation
5. Improve logout implementation

## Acceptance Criteria
- [ ] Access tokens expire in 15 minutes
- [ ] Refresh tokens implemented and secure
- [ ] Revocation mechanism working
- [ ] Logout invalidates tokens
- [ ] Tests verify token lifecycle

**Priority**: HIGH  
**Effort**: 5-6 hours

---

### Issue #10: Auth Tokens in localStorage

**Title**: 🟠 HIGH: Authentication Tokens Stored in localStorage (XSS Vulnerable)

**Labels**: `security`, `high`, `xss`, `token-management`

**Description**:

## Problem
Auth tokens stored in plain text in localStorage, vulnerable to XSS attacks.

```typescript
localStorage.setItem(TOKEN_KEY, newToken);
localStorage.setItem(USER_KEY, JSON.stringify(newUser));
```

## Solution
1. Store tokens in httpOnly, Secure cookies
2. Use sessionStorage for temporary data
3. Implement CSP to prevent XSS
4. Keep only non-sensitive data in localStorage

## Acceptance Criteria
- [ ] Tokens in httpOnly cookies
- [ ] Secure flag set
- [ ] SameSite attribute configured
- [ ] CSP policy prevents XSS
- [ ] localStorage contains no sensitive data
- [ ] Tests verify security

**Priority**: HIGH  
**Effort**: 4-5 hours

---

### Issue #11: No Account Enumeration Protection

**Title**: 🟠 HIGH: Login Response Timing Could Reveal Valid Accounts

**Labels**: `security`, `high`, `authentication`, `enumeration-attack`

**Description**:

## Problem
Timing attacks could reveal if accounts exist based on response time differences.

## Solution
1. Ensure consistent response times
2. Generic error messages for all failures
3. Implement timing attack protection
4. Monitor for enumeration patterns

## Acceptance Criteria
- [ ] Error messages don't reveal account existence
- [ ] Response times consistent
- [ ] Tests verify timing protection

**Priority**: HIGH  
**Effort**: 2-3 hours

---

## MEDIUM PRIORITY ISSUES

### Issue #12: Missing Structured Logging and Monitoring

**Title**: 🟡 MEDIUM: No Structured Logging for Security Events

**Labels**: `security`, `medium`, `logging`, `monitoring`

**Description**:

## Problem
Application uses console.log; no structured logging or security monitoring.

## Solution
1. Implement Winston or Pino for structured logging
2. Log all auth attempts
3. Log data access/modification
4. Log sensitive operations
5. Implement alerting for suspicious patterns

## Acceptance Criteria
- [ ] Structured logging implemented
- [ ] Auth events logged
- [ ] Data operations logged
- [ ] Suspicious patterns detected
- [ ] Logs accessible for analysis

**Priority**: MEDIUM  
**Effort**: 5-6 hours

---

### Issue #13: Missing API Documentation

**Title**: 🟡 MEDIUM: No API Documentation - Security Requirements Unclear

**Labels**: `medium`, `documentation`, `api`

**Description**:

## Problem
No OpenAPI/Swagger documentation; developers may implement insecure requests.

## Solution
1. Create OpenAPI specification
2. Document all endpoints
3. Clearly document auth requirements
4. Include security notes
5. Provide usage examples

## Acceptance Criteria
- [ ] OpenAPI spec created
- [ ] All endpoints documented
- [ ] Auth requirements clear
- [ ] Security notes included

**Priority**: MEDIUM  
**Effort**: 4-5 hours

---

### Issue #14: No Dependency Vulnerability Scanning

**Title**: 🟡 MEDIUM: No Automated Dependency Vulnerability Scanning

**Labels**: `security`, `medium`, `dependencies`

**Description**:

## Problem
No automated scanning for known vulnerabilities in dependencies.

## Solution
1. Enable Dependabot on GitHub
2. Run `npm audit` in CI/CD
3. Regularly update dependencies
4. Subscribe to security advisories

## Acceptance Criteria
- [ ] Dependabot enabled
- [ ] CI/CD checks vulnerabilities
- [ ] Update policy documented

**Priority**: MEDIUM  
**Effort**: 1-2 hours

---

### Issue #15: CORS Not Restricted to Trusted Origins

**Title**: 🟡 MEDIUM: CORS Allows Requests from Any Origin

**Labels**: `security`, `medium`, `cors`, `csrf`

**Description**:

## Problem
CORS configured to allow all origins without validation.

```typescript
app.use(cors());  // Allows ALL origins!
```

## Solution
1. Configure CORS for specific origins only
2. Load from environment variable
3. Validate origin on each request
4. Document CORS policy

## Acceptance Criteria
- [ ] CORS restricted to trusted origins
- [ ] Origins configurable
- [ ] Production origins documented

**Priority**: MEDIUM  
**Effort**: 1-2 hours

---

### Issue #16: Generic Error Handling Could Leak Information

**Title**: 🟡 MEDIUM: Error Messages Need Review for Information Disclosure

**Labels**: `security`, `medium`, `error-handling`

**Description**:

## Problem
Generic error handling needed to prevent information disclosure.

## Solution
1. Return generic errors to clients
2. Log detailed errors server-side
3. Never expose stack traces
4. Use error codes for handling
5. Implement error boundaries

## Acceptance Criteria
- [ ] Generic error messages
- [ ] Detailed logs server-side
- [ ] No stack trace exposure
- [ ] Error codes standardized

**Priority**: MEDIUM  
**Effort**: 2-3 hours

---

### Issue #17: Missing Input Sanitization

**Title**: 🟡 MEDIUM: String Inputs Not Sanitized

**Labels**: `security`, `medium`, `validation`, `sanitization`

**Description**:

## Problem
String inputs (name, email) not sanitized or escaped.

## Solution
1. Sanitize all string inputs
2. Use DOMPurify for HTML content
3. Validate against expected format
4. Remove special characters as needed

## Acceptance Criteria
- [ ] Sanitization implemented
- [ ] Tests for malicious inputs
- [ ] Special characters handled

**Priority**: MEDIUM  
**Effort**: 3-4 hours

---

### Issue #18: Missing Security Configuration Documentation

**Title**: 🟡 MEDIUM: Create Security Configuration Guide

**Labels**: `documentation`, `security`, `medium`

**Description**:

## Problem
Security practices not centrally documented.

## Solution
1. Create `.security.json` or security guide
2. Document all security settings
3. Document password requirements
4. Create deployment security checklist
5. Document review process

## Acceptance Criteria
- [ ] Security config documented
- [ ] All settings listed
- [ ] Deployment checklist created
- [ ] Review process documented

**Priority**: MEDIUM  
**Effort**: 2-3 hours

---

## LOW PRIORITY ISSUES

### Issue #19: No Two-Factor Authentication

**Title**: 🔵 LOW: Implement Optional Two-Factor Authentication

**Labels**: `feature`, `security`, `low`, `2fa`

**Description**:

## Problem
No 2FA support for enhanced account security.

## Solution
1. Implement TOTP with Google Authenticator
2. Generate QR codes
3. Provide recovery codes
4. Make optional but recommended

## Acceptance Criteria
- [ ] TOTP 2FA implemented
- [ ] QR code generation working
- [ ] Recovery codes available
- [ ] Tests passing

**Priority**: LOW  
**Effort**: 6-8 hours

---

### Issue #20: No Account Activity Logging

**Title**: 🔵 LOW: Add Login History and Session Management

**Labels**: `feature`, `security`, `low`

**Description**:

## Problem
Users cannot see login history or manage active sessions.

## Solution
1. Track login history (IP, timestamp, device)
2. Show active sessions
3. Allow session revocation
4. Alert on new login locations
5. Detect suspicious logins

## Acceptance Criteria
- [ ] Login history tracked
- [ ] Sessions displayed in UI
- [ ] Session revocation working
- [ ] Alerts sent

**Priority**: LOW  
**Effort**: 6-8 hours

---

### Issue #21: No Encryption at Rest

**Title**: 🔵 LOW: Implement Encryption at Rest for Sensitive Data

**Labels**: `security`, `low`, `encryption`

**Description**:

## Problem
User data stored as plain JSON files.

## Solution
1. Encrypt sensitive data at rest
2. Manage encryption keys separately
3. Maintain query capability
4. Document encryption strategy

## Acceptance Criteria
- [ ] Encryption implemented
- [ ] Keys managed securely
- [ ] Migration path documented

**Priority**: LOW  
**Effort**: 8-10 hours

---

### Issue #22: Missing Privacy Policy

**Title**: 🔵 LOW: Create Privacy Policy and Data Handling Documentation

**Labels**: `documentation`, `compliance`, `low`

**Description**:

## Problem
No privacy policy; GDPR/CCPA compliance unclear.

## Solution
1. Create privacy policy
2. Document data retention
3. Implement right to deletion
4. Document data sharing
5. Add privacy link in app

## Acceptance Criteria
- [ ] Privacy policy created
- [ ] Data retention documented
- [ ] Right to deletion implemented
- [ ] Data export working
- [ ] Privacy link added

**Priority**: LOW  
**Effort**: 4-5 hours

---

### Issue #23: No Security Headers Testing

**Title**: 🔵 LOW: Add Security Header Validation Tests

**Labels**: `testing`, `security`, `low`

**Description**:

## Problem
No tests for security headers.

## Solution
1. Add header validation tests
2. Test all security headers
3. Include in E2E tests
4. Verify in CI/CD

## Acceptance Criteria
- [ ] Tests added
- [ ] All headers verified
- [ ] CI/CD passing
- [ ] Coverage reported

**Priority**: LOW  
**Effort**: 2-3 hours

---

### Issue #24: No API Key System

**Title**: 🔵 LOW: Implement API Key Generation for Integrations

**Labels**: `feature`, `security`, `low`, `api`

**Description**:

## Problem
No API key support for third-party integrations.

## Solution
1. Implement API key generation
2. Support scoped/limited permissions
3. Implement key rotation
4. Log key usage
5. Add key management UI

## Acceptance Criteria
- [ ] API keys generated
- [ ] Scopes working
- [ ] Rotation available
- [ ] Usage logged

**Priority**: LOW  
**Effort**: 8-10 hours

---

## Summary

- **CRITICAL**: 5 issues requiring immediate attention
- **HIGH**: 6 issues requiring urgent attention
- **MEDIUM**: 7 issues requiring planned implementation
- **LOW**: 6 issues for future enhancement

**Total**: 24 security issues identified and ready to implement.
