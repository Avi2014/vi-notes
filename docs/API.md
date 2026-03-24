# Vi-Notes API Documentation

## Overview

The Vi-Notes API is a RESTful API built with Express.js that handles all communication between the frontend and backend. All responses follow a consistent JSON format.

## Response Format

All API responses follow this structure:

```json
{
  "success": true/false,
  "data": { /* response data */ },
  "error": null or "error message",
  "timestamp": "ISO-8601 datetime"
}
```

### Example Success Response
```json
{
  "success": true,
  "data": {
    "message": "Vi-Notes backend is running"
  },
  "error": null,
  "timestamp": "2024-03-24T10:30:45.123Z"
}
```

### Example Error Response
```json
{
  "success": false,
  "data": null,
  "error": "Internal Server Error",
  "timestamp": "2024-03-24T10:30:45.123Z"
}
```

---

## Endpoints

### Health Check

#### GET `/api/health`

Verifies that the backend server is running and responsive.

**Request**
```bash
curl http://localhost:5000/api/health
```

**Response**
```json
{
  "success": true,
  "message": "Vi-Notes backend is running",
  "timestamp": "2024-03-24T10:30:45.123Z"
}
```

**Status Code**: `200 OK`

---

## Feature #1: Basic Writing Editor

### Currently Implemented

For Feature #1, the editor is a **client-side only** component. No backend API endpoints are required for the editor to function.

The editor:
- Captures text locally in the React component state
- Calculates word/character counts on the client
- Saves (button functionality ready, implementation in Feature #5)

### Future Integration (Feature #5)

Feature #5 will add:
- `POST /api/sessions` - Save a new writing session
- `GET /api/sessions` - Retrieve all sessions
- `GET /api/sessions/:id` - Retrieve specific session
- `PUT /api/sessions/:id` - Update session
- `DELETE /api/sessions/:id` - Delete session

---

## Authentication

### Coming in Feature #2

Feature #2 will implement:
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user info

All protected endpoints will require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## Error Codes

| Code | Status | Meaning |
|------|--------|---------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Endpoint or resource not found |
| 500 | Internal Server Error | Server error |

---

## Base URL

```
http://localhost:5000
```

For production, replace with your deployed backend URL.

---

## Testing Endpoints

### Using curl

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Pretty print JSON response
curl http://localhost:5000/api/health | jq .
```

### Using Thunder Client (VS Code)

1. Install Thunder Client extension
2. Click "New Request"
3. Enter URL: `http://localhost:5000/api/health`
4. Click "Send"

### Using Postman

1. [Download Postman](https://www.postman.com/downloads/)
2. Create new request
3. URL: `http://localhost:5000/api/health`
4. Method: GET
5. Click "Send"

---

## Rate Limiting

Coming in Feature #2 - Auth endpoints will have rate limiting to prevent brute force attacks.

---

## CORS

The API allows requests from:
- Frontend URL (configurable via `FRONTEND_URL` env variable)
- Default: `http://localhost:3000`

Requests from other origins will be rejected.

---

## Versioning

Current API Version: **v1** (implied, not in URL path)

Future versions will use: `/api/v2/`, `/api/v3/`, etc.

---

## Pagination

Will be implemented in Feature #5 for session listings.

Standard query parameters:
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20, max: 100)

---

## Sorting & Filtering

Will be implemented in Feature #5.

Standard query parameters:
- `sort`: Field to sort by
- `order`: `asc` or `desc`
- Filter parameters depend on endpoint

---

## Notes for Feature #1

In Feature #1, the editor is **completely client-side**. This means:

✅ No network calls needed
✅ Works offline
✅ Instant response
✅ No server load

The backend is running and ready for future features, but the editor doesn't depend on it.

---

## Feature Roadmap & API Additions

| Feature | Endpoints Added |
|---------|-----------------|
| #1: Editor | None (client-side) |
| #2: Auth | POST `/auth/register`, POST `/auth/login`, GET `/auth/me` |
| #3: Keystroke Tracking | POST `/api/keystrokes/batch` |
| #4: Paste Detection | Included in keystroke batch endpoint |
| #5: Session Persistence | Complete CRUD for sessions |

---

## Best Practices

### For API Consumers
1. Always check the `success` field before accessing `data`
2. Include appropriate error handling for failed requests
3. Use appropriate HTTP methods (GET for retrieval, POST for creation)
4. Include JWT token for authenticated endpoints (Feature #2+)

### For API Developers
1. Validate all input data on the server
2. Use appropriate HTTP status codes
3. Provide clear error messages
4. Log API calls for debugging
5. Keep the response format consistent

---

## Debugging

### Check Server is Running

```bash
# Should see startup message
npm run dev

# Or test health endpoint
curl http://localhost:5000/api/health
```

### Check CORS Issues

If frontend can't reach backend:
1. Verify backend is running on correct port
2. Check browser console for CORS errors
3. Verify `FRONTEND_URL` environment variable
4. Ensure no firewall blocking the connection

### Check Network Requests

In browser DevTools:
1. Open Network tab
2. Make API request
3. Click request to see full details
4. Check Response tab for server response

---

## Future Enhancements

- [ ] API versioning (v1, v2)
- [ ] Request rate limiting
- [ ] Request validation middleware
- [ ] API documentation auto-generation (Swagger/OpenAPI)
- [ ] API analytics and monitoring

---

## Related Documentation

- [Feature #1: Editor](./FEATURE_1_EDITOR.md)
- [SETUP.md - Installation Guide](./SETUP.md)
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) (Feature #5)

---

**Last Updated**: March 24, 2026
**API Version**: 1.0.0
