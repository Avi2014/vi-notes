# Feature #4: Paste Detection

## Overview

Feature #4 implements **paste event detection and tracking** for the Vi-Notes authenticity verification system. This feature captures metadata about pasted content (length, multiline status) without storing the actual pasted text, maintaining strict privacy standards.

## Architecture

### Privacy-First Design

- **What IS captured**: Paste metadata (character count, newline presence, timestamps)
- **What IS NOT captured**: Pasted content, clipboard data, or any text content
- **Security**: All paste events are encrypted and auto-deleted after 30 days

### Data Flow

```
User pastes text in editor
        ↓
JavaScript paste event listener triggered
        ↓
Extract metadata: { pastedLength, isMultiline, timestamp }
        ↓
Buffer event in memory (20 events or 10s)
        ↓
Submit batch to backend via POST /api/pastes
        ↓
Backend validates and stores in MongoDB
        ↓
Frontend re-buffers on failure
        ↓
TTL index auto-deletes after 30 days
```

## Backend Implementation

### Models

#### PasteEvent Model (`backend/src/models/PasteEvent.ts`)

```typescript
interface IPasteEvent {
  userId: string;              // User ID (indexed)
  sessionId?: string;          // Session ID for grouping (indexed)
  pastedLength: number;        // Length of pasted text (1-1,000,000)
  isMultiline: boolean;        // Whether paste contains newlines
  timestamp: number;           // Unix timestamp (ms)
  createdAt: Date;            // Auto-created timestamp (TTL: 30 days)
}
```

**Indexes**:
- `userId` - Fast lookup by user
- `sessionId` - Group events by editing session
- `userId + createdAt` - Efficient range queries
- `createdAt` with **TTL: 30 days** - Auto-delete old records

**Validation**:
- `pastedLength`: 1-1,000,000 characters (reasonable paste limit)
- `isMultiline`: Boolean validation
- `timestamp`: Positive integer validation

### Routes

#### POST /api/pastes (Protected)

Submit a batch of paste events to the backend.

**Request**:
```json
{
  "sessionId": "session-1711270800000-a1b2c3d4e",
  "events": [
    {
      "pastedLength": 245,
      "isMultiline": true,
      "timestamp": 1711270805000
    },
    {
      "pastedLength": 89,
      "isMultiline": false,
      "timestamp": 1711270810000
    }
  ]
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "insertedCount": 2,
    "message": "2 paste events submitted successfully"
  },
  "timestamp": "2026-03-24T10:00:00.000Z"
}
```

**Validations**:
- JWT authentication required
- Events array must not be empty
- Each event must have valid `pastedLength` (1-1,000,000)
- Each event must have valid `isMultiline` (boolean)
- Each event must have valid `timestamp` (number > 0)

---

#### GET /api/pastes/stats (Protected)

Retrieve paste statistics for the authenticated user.

**Query Parameters**:
- `days` - Number of days to look back (default: 7, max: 90)

**Request**:
```
GET /api/pastes/stats?days=7
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "totalPasteCount": 25,
    "averagePasteLength": 245,
    "multilinePasteCount": 15,
    "pastesByDay": {
      "2026-03-24": 5,
      "2026-03-23": 3,
      "2026-03-22": 8,
      "2026-03-21": 4,
      "2026-03-20": 5
    },
    "dateRange": {
      "from": "2026-03-17",
      "to": "2026-03-24"
    }
  },
  "timestamp": "2026-03-24T10:00:00.000Z"
}
```

---

## Frontend Implementation

### Services

#### pasteService.ts (`frontend/src/services/pasteService.ts`)

Axios client for paste event API calls.

```typescript
// Submit batch of paste events
await submitPasteEvents(sessionId, events)

// Get paste statistics
await getPasteStats(7)  // Last 7 days
```

**Features**:
- JWT interceptor on all requests
- Automatic token from localStorage
- Error handling and logging
- Response unwrapping

---

### Hooks

#### usePasteTracking Hook (`frontend/src/hooks/usePasteTracking.ts`)

React hook for capturing paste events and managing batching.

```typescript
const { 
  attachListener,    // Attach listener to element
  submitBatch,       // Manually submit buffered events
  setEnabled,        // Enable/disable tracking
  getBufferSize      // Get current buffer size
} = usePasteTracking(sessionId);

// Attach to textarea
useEffect(() => {
  attachListener(textareaRef.current);
}, [attachListener]);
```

**Features**:
- Captures paste events from clipboard
- Batches events (20 or 10 seconds)
- Auto-submit on unmount
- Re-buffer failed submissions
- Toggle tracking on/off
- Check buffer size

**Batching Strategy**:
- **Batch Size**: 20 paste events or 10 seconds (whichever comes first)
- **Max Buffer**: 200 events (prevents memory overflow)
- **Failure Handling**: Re-adds failed events to buffer for retry

---

### Integration

#### TextEditor Component (Updated)

```typescript
import { usePasteTracking } from '../../hooks/usePasteTracking';

export const TextEditor: React.FC<TextEditorProps> = ({ onSave }) => {
  // ... existing code ...

  // Initialize paste tracking
  const { attachListener: attachPasteListener } = usePasteTracking(sessionIdRef.current);

  // Attach paste listener
  useEffect(() => {
    if (textareaRef.current) {
      attachPasteListener(textareaRef.current);
    }
  }, [attachPasteListener]);

  return (
    <textarea
      ref={textareaRef}
      // ... rest of textarea ...
    />
  );
};
```

---

## Testing

### Manual Testing

1. **Start both servers**:
   ```bash
   # Terminal 1: Backend
   cd backend
   npm run dev
   
   # Terminal 2: Frontend
   cd frontend
   npm run dev
   ```

2. **Login to application**:
   - Navigate to http://localhost:3001
   - Login with your test credentials

3. **Test paste detection**:
   - Open browser DevTools (F12)
   - Go to Console tab
   - Click in the textarea editor
   - Copy some text from another source
   - Paste into the textarea
   - Watch for console message: `📋 Detected paste: X chars, multiline: true/false`
   - Wait 10 seconds or make 20 pastes to trigger batch submission
   - Should see: `✓ Submitted X paste events`

4. **Verify in MongoDB**:
   ```bash
   # Query paste events
   db.pasteevents.find({ userId: "your-user-id" }).pretty()
   ```

5. **Test statistics endpoint**:
   ```bash
   curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:5001/api/pastes/stats?days=7
   ```

---

## Performance Characteristics

| Metric | Value |
|--------|-------|
| Batch Size | 20 pastes |
| Batch Timeout | 10 seconds |
| Max Buffer | 200 events |
| Max Paste Length | 1,000,000 chars |
| API Payload Size | ~4KB per batch |
| Data Retention | 30 days (TTL) |

---

## Privacy & Security

✅ **No Pasted Content Stored**
- Only metadata: length and multiline status
- Never stores clipboard content
- Never stores actual pasted text

✅ **Timestamps Only**
- Records when paste occurred
- No content analysis

✅ **Session Privacy**
- Events grouped by session ID
- Session IDs are randomly generated
- No user-identifiable information in metadata

✅ **TTL Auto-Deletion**
- MongoDB TTL index deletes all records after 30 days
- No manual cleanup required
- Automatic privacy protection

✅ **JWT Protection**
- All endpoints require authentication
- Only authenticated users can submit/view their data

---

## Integration Examples

### Full Workflow

```typescript
import { useAuth } from './hooks/useAuth';
import { usePasteTracking } from './hooks/usePasteTracking';

export function WritingEditor() {
  const { user } = useAuth();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const sessionId = useRef(
    `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  ).current;

  const { attachListener } = usePasteTracking(sessionId);

  useEffect(() => {
    if (textareaRef.current) {
      attachListener(textareaRef.current);
    }
  }, [attachListener]);

  return (
    <textarea
      ref={textareaRef}
      placeholder="Paste content here - paste events will be tracked"
    />
  );
}
```

### Getting Statistics

```typescript
import { getPasteStats } from './services/pasteService';
import { useEffect, useState } from 'react';

export function PasteStatistics() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getPasteStats(7)  // Last 7 days
      .then(data => {
        console.log('Total pastes:', data.totalPasteCount);
        console.log('Average length:', data.averagePasteLength);
        setStats(data);
      })
      .catch(error => console.error('Failed to load stats:', error));
  }, []);

  return (
    <div>
      <h3>Paste Statistics</h3>
      {stats && <p>Total pastes: {stats.totalPasteCount}</p>}
    </div>
  );
}
```

---

## Files Created

**Backend**:
- `backend/src/models/PasteEvent.ts` - Mongoose model
- `backend/src/routes/paste.routes.ts` - API routes

**Frontend**:
- `frontend/src/services/pasteService.ts` - API client
- `frontend/src/hooks/usePasteTracking.ts` - React hook

**Updated Files**:
- `backend/src/app.ts` - Added paste route registration
- `frontend/src/components/Editor/TextEditor.tsx` - Added paste tracking integration

---

## Relationship to Other Features

- **Feature #3** (Keystroke Tracking): Complementary - tracks typing speed
- **Feature #4** (Paste Detection): Tracks pasted content metadata
- **Feature #5** (Session Persistence): Will aggregate keystroke + paste data

Together, Features #3 and #4 provide comprehensive behavioral analysis without storing content.

---

## Future Enhancements

- Paste detection with AI model for authenticity scoring
- Combination analysis: keystroke patterns + paste ratio
- Export paste statistics in dashboard
- Alerts for unusual paste patterns (plagiarism detection)
- Integration with plagiarism detection APIs

---

## Troubleshooting

### Paste events not being captured

1. Check browser console for errors
2. Verify textarea has focus when pasting
3. Ensure JWT token is valid (check localStorage)
4. Check Network tab to see if POST request succeeds

### Batches not submitting

1. Check that 10 seconds have passed OR 20 pastes made
2. Look for errors in response (Network tab)
3. Verify backend is running on correct port (5001)

### MongoDB errors

1. Confirm Atlas connection string in .env.local
2. Check that MONGODB_URI is set correctly
3. Verify IP whitelist includes your machine
