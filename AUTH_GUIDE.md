# 🔐 Authentication Guide - DLC Dev Stack

## Overview

The DLC Dev Stack implements a secure JWT-based authentication system using industry-standard libraries:
- **@nestjs/jwt** - JWT token generation and validation
- **@nestjs/passport** - Authentication framework integration
- **passport-jwt** - JWT strategy for Passport
- **bcrypt** - Password hashing (ready for future user management)

## Architecture

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Client     │ Login   │   API Auth   │  JWT    │  Protected   │
│  (Browser)   │────────▶│  Controller  │◄────────│  Resources   │
│              │ Token   │              │ Verify  │              │
└──────────────┘         └──────────────┘         └──────────────┘
```

## Environment Configuration

Add the following to your `.env` file:

```bash
# JWT Configuration
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_EXPIRES_IN=86400  # Token expires in 24 hours (in seconds)

# Admin Credentials (Default)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
```

⚠️ **Security Warning**: Always use strong, randomly generated secrets in production!

## Authentication Flow

### 1. Login Request

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "username": "admin",
  "password": "your-password"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresAt": "2025-10-19T14:54:46.808Z",
    "user": {
      "id": "admin",
      "username": "admin",
      "roles": ["admin"]
    }
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid credentials",
  "error": {
    "code": "AUTH_INVALID_CREDENTIALS",
    "status": 401
  }
}
```

### 2. Using the Token

Include the JWT token in the Authorization header for protected endpoints:

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Token Validation

The JWT strategy automatically validates tokens on protected routes:
- Checks token signature
- Verifies expiration
- Extracts user information

## Implementation Examples

### Frontend (JavaScript/TypeScript)

```typescript
// Login
async function login(username: string, password: string) {
  const response = await fetch('http://localhost:30089/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });
  
  const result = await response.json();
  
  if (result.success) {
    // Store token (localStorage, sessionStorage, or cookie)
    localStorage.setItem('authToken', result.data.token);
    localStorage.setItem('tokenExpiry', result.data.expiresAt);
    return result.data;
  }
  
  throw new Error(result.message || 'Login failed');
}

// Making authenticated requests
async function fetchProtectedData() {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch('http://localhost:30089/protected-endpoint', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  return await response.json();
}

// Check if token is expired
function isTokenExpired(): boolean {
  const expiry = localStorage.getItem('tokenExpiry');
  if (!expiry) return true;
  return new Date(expiry) < new Date();
}
```

### Backend - Protecting Routes

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './modules/auth/jwt-auth.guard';

@Controller('protected')
export class ProtectedController {
  
  @Get()
  @UseGuards(JwtAuthGuard)
  async getProtectedData() {
    return {
      message: 'This is protected data',
      data: { /* ... */ }
    };
  }
}
```

### Getting User from Request

```typescript
import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from './modules/auth/jwt-auth.guard';

@Controller('profile')
export class ProfileController {
  
  @Get()
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    // req.user contains the validated JWT payload
    return {
      user: req.user,
      // user object contains: userId, username, roles
    };
  }
}
```

## cURL Examples

### Login
```bash
curl -X POST http://localhost:30089/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "your-password"
  }'
```

### Access Protected Resource
```bash
curl http://localhost:30089/protected-endpoint \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## Token Structure

JWT tokens contain three parts (separated by dots):

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.     # Header
eyJzdWIiOiJhZG1pbiIsInVzZXJuYW1lIj...     # Payload
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_a...   # Signature
```

**Decoded Payload Example:**
```json
{
  "sub": "admin",
  "username": "admin",
  "roles": ["admin"],
  "iat": 1729262086,
  "exp": 1729348486
}
```

## Security Best Practices

1. **Never expose JWT_SECRET**: Keep it in environment variables, never commit to version control
2. **Use HTTPS in production**: Tokens should only be transmitted over secure connections
3. **Short expiration times**: Balance between security and user experience (24 hours is reasonable)
4. **Rotate secrets regularly**: Change JWT_SECRET periodically in production
5. **Implement token refresh**: Add refresh token mechanism for better UX
6. **Validate on every request**: Always verify token signature and expiration
7. **Use strong passwords**: Implement password complexity requirements
8. **Rate limiting**: Protect login endpoint from brute force attacks (already configured)

## Health Check

The health endpoint includes JWT configuration status:

```bash
curl http://localhost:30089/health
```

Response includes:
```json
{
  "status": "ok",
  "version": "1.0.2-alpha",
  "auth": {
    "jwtConfigured": true
  },
  // ... other health data
}
```

## Future Enhancements

- [ ] User registration endpoint
- [ ] Password hashing with bcrypt
- [ ] Refresh token mechanism
- [ ] Token revocation/blacklist
- [ ] Role-based access control (RBAC) guards
- [ ] OAuth2/Social login integration
- [ ] Two-factor authentication (2FA)
- [ ] Password reset flow
- [ ] Session management

## Troubleshooting

### "Invalid or expired token" Error
- Check if token has expired (compare `expiresAt` with current time)
- Verify token format: `Bearer <token>`
- Ensure JWT_SECRET matches between token creation and validation

### Login Fails with Correct Credentials
- Check ADMIN_USERNAME and ADMIN_PASSWORD in `.env`
- Verify environment variables are loaded (restart API after changes)
- Check API logs for detailed error messages

### CORS Issues
- Ensure CORS_ORIGIN includes your frontend URL
- Check that Authorization header is allowed in CORS config

---

**Version:** 1.0.2-alpha  
**Last Updated:** 2025-10-18

Built with ❤️ by EverVibe Studios
