# Feature #2: User Login & Registration

## Overview

Feature #2 implements user authentication with JWT-based login and registration. Users can create accounts, securely log in, and maintain authenticated sessions across the application.

## Architecture

### Backend Components

#### 1. **User Model** (`backend/src/models/User.ts`)
- Mongoose schema with email and password hash fields
- Email validation using regex pattern
- Pre-save hook automatically hashes passwords using bcrypt (10 salt rounds)
- Instance method `comparePassword()` for password verification
- Timestamps for creation and updates

```typescript
interface IUser extends Document {
  _id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}
```

#### 2. **Auth Controller** (`backend/src/controllers/authController.ts`)

**Register endpoint**:
- Validates email format and password length (min 6 chars)
- Checks for duplicate email
- Hashes password via User pre-save hook
- Generates JWT token (7-day expiration)
- Returns user data and token

**Login endpoint**:
- Validates email and password presence
- Retrieves user from database
- Compares provided password with stored hash
- Generates JWT token on success
- Returns user data and token

**getCurrentUser endpoint**:
- Protected route (requires JWT in Authorization header)
- Extracts user ID from JWT token
- Returns verified user data without password

#### 3. **Auth Middleware** (`backend/src/middleware/authMiddleware.ts`)
- Extracts JWT from `Authorization: Bearer <token>` header
- Verifies token signature and expiration
- Attaches user object to request
- Returns 401 if invalid or missing
- Custom `AuthenticatedRequest` interface for TypeScript

#### 4. **Auth Routes** (`backend/src/routes/auth.routes.ts`)
- `POST /api/auth/register` - Register new user (public)
- `POST /api/auth/login` - Login user (public)
- `GET /api/auth/me` - Get current user (protected)

### Frontend Components

#### 1. **Auth Types** (`frontend/src/types/auth.ts`)
- `User` interface with id and email
- `AuthResponse` with token and user
- `AuthContextType` defining auth context shape

#### 2. **Auth Service** (`frontend/src/services/authService.ts`)
- Axios instance configured for `/api/auth` endpoints
- Request interceptor adds JWT to Authorization header
- Response interceptor clears auth data on 401
- Methods: `registerUser()`, `loginUser()`, `getCurrentUser()`
- LocalStorage helpers: `saveAuthData()`, `getAuthData()`, `clearAuthData()`

#### 3. **useAuth Hook** (`frontend/src/hooks/useAuth.ts`)
- React Context provider for authentication state
- Manages: user, token, isLoading, isAuthenticated, error
- Methods: `register()`, `login()`, `logout()`
- Loads auth from localStorage on initialization
- Custom hook to access auth context

#### 4. **LoginPage** (`frontend/src/pages/LoginPage.tsx`)
- Email and password form fields
- Client-side validation (email format, required fields)
- Shows error messages from API
- Redirects to editor on successful login
- Link to register page

#### 5. **RegisterPage** (`frontend/src/pages/RegisterPage.tsx`)
- Email, password, and confirm password fields
- Client-side validation (format, length, matching)
- Shows API error messages
- Redirects to editor on successful registration
- Link to login page

#### 6. **ProtectedRoute** (`frontend/src/components/ProtectedRoute.tsx`)
- Wrapper for routes requiring authentication
- Checks `isAuthenticated` from auth context
- Shows loading spinner while auth state initializes
- Redirects unauthenticated users to login

#### 7. **Updated App.tsx**
- Wraps app with `AuthProvider` and `BrowserRouter`
- Routes:
  - `/login` - Login page (public)
  - `/register` - Register page (public)
  - `/editor` - Editor page (protected)
  - `/` - Redirects to editor

#### 8. **Updated EditorPage**
- Display user's email in header
- Logout button that clears auth and redirects to login
- Protected route integration

## API Response Format

### Successful Register Response
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com"
    }
  }
}
```

### Successful Login Response
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com"
    }
  }
}
```

### Error Response (400)
```json
{
  "success": false,
  "error": "Email already registered"
}
```

### Error Response (401)
```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

## Authentication Flow

### Registration Flow
1. User enters email and password on RegisterPage
2. Frontend validates format locally
3. Frontend makes POST request to `/api/auth/register`
4. Backend validates, hashes password, creates user
5. Backend generates JWT token (7-day expiration)
6. Frontend stores token in localStorage
7. Frontend stores user data in localStorage
8. Frontend redirects to editor

### Login Flow
1. User enters email and password on LoginPage
2. Frontend validates format locally
3. Frontend makes POST request to `/api/auth/login`
4. Backend finds user, compares password
5. Backend generates JWT token
6. Frontend stores token and user in localStorage
7. Frontend redirects to editor

### Protected Route Access
1. User navigates to `/editor`
2. ProtectedRoute checks `isAuthenticated`
3. If false, redirects to `/login`
4. If true (or loading), displays EditorPage
5. EditorPage displays user email and logout button

### Logout Flow
1. User clicks logout button
2. Frontend clears token and user from localStorage
3. Frontend updates auth context
4. Frontend redirects to login page
5. Next protected route access triggers redirect to login

## Security Considerations

### Password Security
- Passwords minimum 6 characters (enforced both frontend and backend)
- Passwords hashed with bcrypt (10 salt rounds)
- Plain text passwords never stored or transmitted after hashing
- Password comparison done via bcrypt's `compare()` method

### Token Security
- JWT tokens 7-day expiration (configurable via `JWT_EXPIRY`)
- Tokens stored in browser localStorage (accessible to XSS)
- Authorization header includes `Bearer` prefix
- Tokens verified on each protected endpoint

### Email Validation
- Regex validation ensures valid email format
- Duplicate emails checked in database
- Case-insensitive email storage (normalize in future)

### Request/Response
- CORS configured for frontend origin
- All responses include consistent JSON format
- Error messages generic to prevent user enumeration

## Testing Endpoints

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Login User
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Get Current User (requires token from login response)
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Environment Variables

### Backend (.env.local)
```
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/vi-notes
JWT_SECRET=your-secret-key-min-32-chars-for-security
JWT_EXPIRY=7d
NODE_ENV=development
```

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:5000
```

## Known Limitations

1. **No refresh tokens** - Users must log in again when token expires
2. **No email verification** - Emails not verified before account creation
3. **No password reset** - Users must contact support to reset password
4. **No rate limiting** - No protection against brute force attacks
5. **No 2FA** - Single-factor authentication only
6. **localStorage storage** - Tokens vulnerable to XSS attacks

## Future Enhancements

- Implement refresh token rotation
- Add email verification on registration
- Add password reset flow
- Implement rate limiting on auth endpoints
- Add 2FA support
- Move token storage to secure httpOnly cookies
- Add user profile management
- Add social login (Google, GitHub)

## Files Created

### Backend
- `backend/src/models/User.ts` - User model with bcrypt
- `backend/src/controllers/authController.ts` - Auth handler functions
- `backend/src/middleware/authMiddleware.ts` - JWT verification
- `backend/src/routes/auth.routes.ts` - Auth endpoint routes
- Updated: `backend/src/server.ts`, `backend/src/app.ts`

### Frontend
- `frontend/src/types/auth.ts` - Auth TypeScript interfaces
- `frontend/src/services/authService.ts` - Auth API client
- `frontend/src/hooks/useAuth.ts` - Auth context and hook
- `frontend/src/pages/LoginPage.tsx` - Login component
- `frontend/src/pages/RegisterPage.tsx` - Register component
- `frontend/src/pages/AuthPages.css` - Auth page styles
- `frontend/src/components/ProtectedRoute.tsx` - Route protection
- `frontend/src/pages/EditorPage.css` - Editor page styles
- Updated: `frontend/src/App.tsx`, `frontend/src/pages/EditorPage.tsx`
- Updated: `frontend/package.json` (added react-router-dom)

## Status

✅ Feature #2 Complete
- Backend authentication: Register, Login, getCurrentUser
- Frontend UI: LoginPage, RegisterPage, Protected Routes
- Context & Hooks: AuthProvider, useAuth
- Service layer: authService with Axios interceptors
- Integration: Fully integrated into App routing

Ready for:
- Testing authentication flow
- Committing and pushing to GitHub
- Starting Feature #3 (keystroke tracking)
