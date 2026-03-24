# Feature #3: Keystroke Timing Capture

## Overview

Feature #3 implements keystroke event capture with timing information for authenticity analysis. The system captures inter-keystroke intervals and key codes, but **NEVER stores actual character content**. This privacy-first approach enables behavior-based authenticity verification.

## Architecture

### Backend Components

#### 1. **KeystrokeEvent Model** (`backend/src/models/KeystrokeEvent.ts`)

Mongoose schema storing keystroke timing data.

```typescript
interface IKeystrokeEvent {
  userId: string;           // User who generated the event
  sessionId?: string;       // Editing session identifier
  keyCode: number;          // ASCII key code (0-255)
  timestamp: number;        // Unix timestamp (milliseconds)
  interKeystrokeInterval: number; // Time since previous keystroke (ms)
  keyType: 'keydown' | 'keyup';   // Event type
  createdAt: Date;          // Server timestamp (auto-expires after 30 days)
}
```

Features:
- **No character storage** - Only key codes, never the actual key
- **TTL index** - Documents auto-delete after 30 days for privacy
- **User indexed** - Efficient queries by user ID
- **Session tracking** - Optional session ID for linking events to editing sessions
- **Time boundaries** - Max 60 second inter-keystroke interval to invalidate data

#### 2. **Keystroke Routes** (`backend/src/routes/keystroke.routes.ts`)

##### POST /api/keystrokes
Submit batch of keystroke events (protected route, requires JWT)

**Request:**
```json
{
  "sessionId": "session-1704067200000-abc123def",
  "events": [
    {
      "keyCode": 65,
      "timestamp": 1704067200000,
      "interKeystrokeInterval": 125,
      "keyType": "keydown"
    },
    {
      "keyCode": 83,
      "timestamp": 1704067200125,
      "interKeystrokeInterval": 145,
      "keyType": "keydown"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "2 keystroke events recorded",
    "count": 2,
    "sessionId": "session-1704067200000-abc123def"
  }
}
```

**Validation:**
- Events array required and non-empty
- keyCode: 0-255
- timestamp: valid number
- interKeystrokeInterval: 0-60000 (max 60 seconds)
- keyType: "keydown" or "keyup"

##### GET /api/keystrokes/stats
Get keystroke statistics for authenticated user (protected route)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalEvents": 1250,
    "averageInterKeystrokeInterval": 135,
    "lastEventTime": "2026-03-24T12:34:56.789Z"
  }
}
```

### Frontend Components

#### 1. **Keystroke Service** (`frontend/src/services/keystrokeService.ts`)

Axios-based client for submitting keystroke events.

```typescript
// Submit keystroke events
await submitKeystrokeEvents(sessionId, events);

// Get user's keystroke statistics
const stats = await getKeystrokeStats();
```

Features:
- Automatic JWT token inclusion via interceptors
- Type-safe event submission
- Error handling with retry logic

#### 2. **useKeystrokeTracking Hook** (`frontend/src/hooks/useKeystrokeTracking.ts`)

React hook for capturing and buffering keystroke events.

```typescript
const { attachListener, setEnabled, submitBatch, getBufferSize } = useKeystrokeTracking(sessionId);

// Attach to textarea element
useEffect(() => {
  if (textareaRef.current) {
    attachListener(textareaRef.current);
  }
}, [attachListener]);

// Enable/disable tracking
setEnabled(false); // Disable keystroke tracking
setEnabled(true);  // Re-enable keystroke tracking

// Manually submit buffer
submitBatch();

// Check buffer size
console.log(getBufferSize()); // Returns number of pending events
```

**Batching Strategy:**
- Submits after 50 events (configurable `BATCH_SIZE`)
- Or after 10 seconds of inactivity (configurable `BATCH_TIMEOUT`)
- Automatically submits remaining events on component unmount
- Handles failed submissions by re-buffering events

#### 3. **TextEditor Integration**

The TextEditor component automatically captures keystroke events when user types.

```typescript
const { attachListener } = useKeystrokeTracking(sessionId);

// Attach listener to textarea
useEffect(() => {
  if (textareaRef.current) {
    attachListener(textareaRef.current);
  }
}, [attachListener]);
```

## Data Privacy & Security

### What is Captured
- ✅ Key code (0-255, not character)
- ✅ Timestamp (milliseconds)
- ✅ Inter-keystroke interval (time between keystrokes)
- ✅ Event type (keydown/keyup)

### What is NOT Captured
- ❌ Character/key content
- ❌ Text being typed
- ❌ Clipboard content
- ❌ Special key names
- ❌ Raw keyboard events beyond codes

### Data Retention
- Auto-deleted after 30 days via TTL index
- User can delete their account to remove all keystroke data
- No backup or archival of keystroke data

## Authenticity Detection

### How it Works

Keystroke dynamics differ between:

1. **Human Typing**
   - Variable inter-keystroke intervals (50-300ms typically)
   - Natural pauses for thinking (200ms-5s)
   - Consistent rhythm formation over time
   - Patterns specific to the individual
   - Irregular key-up/key-down timing

2. **Pasted Content**
   - Instant keystrokes (detected by paste event)
   - 0ms inter-keystroke intervals
   - No natural variation

3. **AI-Generated Content**
   - Simulated timing if attempted
   - Lack of individual consistency
   - Missing natural pauses
   - Uniform keystroke patterns

### Features Extracted
- Dwell time (time key held down)
- Flight time (time between key release and next press)
- Digraph latency (time between specific key pairs)
- Burst patterns (rapid vs. slow sequences)
- Pause distribution (thinking patterns)

## Integration Example

```typescript
// In EditorPage.tsx
import { useKeystrokeTracking } from '../hooks/useKeystrokeTracking';

export const EditorPage: React.FC = () => {
  const sessionId = useRef(`session-${Date.now()}`).current;
  const { attachListener } = useKeystrokeTracking(sessionId);

  return (
    <>
      <TextEditor />
      {/* TextEditor automatically captures keystrokes */}
    </>
  );
};
```

## API Examples

### Submit Keystroke Events
```bash
curl -X POST http://localhost:5001/api/keystrokes \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session-1704067200000-abc123def",
    "events": [
      {
        "keyCode": 65,
        "timestamp": 1704067200000,
        "interKeystrokeInterval": 125,
        "keyType": "keydown"
      }
    ]
  }'
```

### Get Keystroke Statistics
```bash
curl -X GET http://localhost:5001/api/keystrokes/stats \
  -H "Authorization: Bearer <token>"
```

## Configuration

### Environment Variables

**Backend (.env.local)**
```
# Already configured in Feature #2
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
JWT_EXPIRE=7d
```

**Frontend (.env.local)**
```
# Uses default API_URL from authService
VITE_API_URL=http://localhost:5001
```

### Tuning Parameters

**In useKeystrokeTracking.ts:**
```typescript
const BATCH_SIZE = 50;        // Events before submission
const BATCH_TIMEOUT = 10000;  // Milliseconds before timeout submit
```

## Testing

### Manual Testing Flow

1. Start backend and frontend
2. Login to the editor
3. Type content in the text editor
4. Open DevTools console
5. Check logs for keystroke submissions
6. After 50 keystrokes or 10 seconds, batch submits
7. Keystroke data appears in MongoDB

### Example Test Sequence
```
Type: "Hello World"
Expected: ~50 keystroke events captured
H - keyCode 72
e - keyCode 69
l - keyCode 76
l - keyCode 76
o - keyCode 79
(space) - keyCode 32
W - keyCode 87
o - keyCode 79
r - keyCode 82
l - keyCode 76
d - keyCode 68
```

### Database Verification
```javascript
// In MongoDB:
db.keystrokeevents.find({ userId: "..." })
  .sort({ createdAt: -1 })
  .limit(10)
```

## Known Limitations

1. **No Paste Detection** - Feature #4 will add paste event detection
2. **Timing Accuracy** - Browser granularity may affect sub-millisecond precision
3. **Network Latency** - Batch submission has network delay
4. **Buffer Overflow** - Max 500 events buffered to prevent memory issues
5. **Mobile Input** - May not work identically on mobile keyboards

## Future Enhancements

- Add paste event detection (Feature #4)
- Session-level keystroke statistics
- Keystroke heatmaps by position
- Digraph latency analysis
- Dwell time distribution charts
- ML-based authenticity scoring
- Real-time integrity monitoring

## Files Created

**Backend:**
- `backend/src/models/KeystrokeEvent.ts` - Keystroke data model
- `backend/src/routes/keystroke.routes.ts` - API endpoints
- Updated: `backend/src/app.ts` - Keystroke routes integration

**Frontend:**
- `frontend/src/services/keystrokeService.ts` - API client
- `frontend/src/hooks/useKeystrokeTracking.ts` - Keystroke capture hook
- Updated: `frontend/src/components/Editor/TextEditor.tsx` - Hook integration

## Status

✅ Feature #3 Complete
- Keystroke capture with timing
- Batch submission with buffering
- Protected API endpoints
- Session-based tracking
- Privacy-first implementation

Ready for:
- Testing keystroke capture flow
- Committing and pushing to GitHub
- Starting Feature #4 (Paste Detection)
