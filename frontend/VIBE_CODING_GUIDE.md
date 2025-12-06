# Vibe Coding Guide - Guardian Frontend Redesign

## What Just Happened

I've set you up with a **parallel development environment**. You can now:
- ✅ Code your new UI freely without breaking the old one
- ✅ Toggle between old and new with a button (top right)
- ✅ Access WebSocket data from ANY component
- ✅ Test both UIs with the same live data

## Your New File Structure

```
frontend/src/
├── App.tsx                          ← Updated with toggle button
├── contexts/
│   └── WebSocketContext.tsx         ← NEW: WebSocket provider
├── pages/
│   └── NewDashboard.tsx             ← NEW: Your canvas!
├── components/
│   └── dashboard/                   ← Create new components here
│       ├── LiveTranscript.tsx
│       ├── CallHeader.tsx
│       └── KeywordAlert.tsx
├── hooks/
│   └── useWebSocket.ts              ← Don't touch! (it works)
└── imports/
    └── IPhoneSe2.tsx                ← Old UI (keep for reference)
```

---

## How to Start Vibe Coding

### Step 1: See Your New Dashboard

Your frontend should auto-reload. You'll see:
- A blue button in top-right corner: **"🎨 New UI"**
- Click it to toggle to your new dashboard
- Click again to go back to old UI

### Step 2: Open Your Canvas

```bash
# Open your new dashboard file
open /Users/memoryiswar/Desktop/Gaurdian\ App/guardian/frontend/src/pages/NewDashboard.tsx
```

This is your blank canvas! The starter template includes:
- ✅ WebSocket connection (already working)
- ✅ Live transcript display
- ✅ Connection status indicator
- ✅ Basic layout structure

### Step 3: Start Designing

Edit `NewDashboard.tsx` however you want. Changes will hot-reload instantly.

---

## The Magic: useWebSocketContext

You can access live transcript data from **ANY component** now:

```typescript
import { useWebSocketContext } from '../contexts/WebSocketContext';

function MyNewComponent() {
  const { isConnected, partialTranscript, finalTranscripts, error } = useWebSocketContext();

  return (
    <div>
      <p>Status: {isConnected ? '🟢 Live' : '🔴 Offline'}</p>
      <p>Messages: {finalTranscripts.length}</p>
    </div>
  );
}
```

### Available Data:

```typescript
{
  isConnected: boolean,          // Is WebSocket connected?
  partialTranscript: string,     // Real-time incomplete text
  finalTranscripts: string[],    // Array of completed sentences
  error: string | null           // Any connection errors
}
```

---

## Vibe Coding Tips

### 1. **Use Tailwind CSS** (Already installed!)

The project has Tailwind configured. Style freely:

```tsx
<div className="bg-gradient-to-r from-purple-500 to-pink-500 p-8 rounded-xl shadow-2xl">
  <h1 className="text-4xl font-bold text-white">Your Vibe</h1>
</div>
```

### 2. **Create Reusable Components**

Don't put everything in `NewDashboard.tsx`. Break it down:

```bash
# Create a new component
touch frontend/src/components/dashboard/LiveTranscript.tsx
```

```typescript
// LiveTranscript.tsx
import { useWebSocketContext } from '../../contexts/WebSocketContext';

export function LiveTranscript() {
  const { finalTranscripts, partialTranscript } = useWebSocketContext();

  return (
    <div className="space-y-4">
      {finalTranscripts.map((text, i) => (
        <div key={i} className="p-4 bg-white rounded-lg shadow">
          {text}
        </div>
      ))}
      {partialTranscript && (
        <div className="p-4 bg-blue-50 rounded-lg">
          {partialTranscript} <span className="animate-pulse">▋</span>
        </div>
      )}
    </div>
  );
}
```

Then use it:
```typescript
// NewDashboard.tsx
import { LiveTranscript } from '../components/dashboard/LiveTranscript';

<LiveTranscript />
```

### 3. **Bring Back Keyword Highlighting**

The old UI has keyword detection. Here's how to add it to your new UI:

```typescript
// Create: components/dashboard/KeywordHighlight.tsx
const SCAM_KEYWORDS = [
  'police', 'arrest', 'warrant', 'bank account', 'social security',
  'urgent', 'immediately', 'gift card', 'bitcoin', 'irs', 'tax'
];

function hasKeyword(text: string): string[] {
  const lower = text.toLowerCase();
  return SCAM_KEYWORDS.filter(keyword => lower.includes(keyword));
}

export function KeywordHighlight({ text }: { text: string }) {
  const keywords = hasKeyword(text);

  if (keywords.length === 0) {
    return <span>{text}</span>;
  }

  // Highlight keywords
  let highlighted = text;
  keywords.forEach(keyword => {
    const regex = new RegExp(`(${keyword})`, 'gi');
    highlighted = highlighted.replace(
      regex,
      '<mark class="bg-red-200 text-red-800 px-1 rounded">$1</mark>'
    );
  });

  return <span dangerouslySetInnerHTML={{ __html: highlighted }} />;
}
```

### 4. **Add Animations**

GSAP is already installed! Add some spice:

```typescript
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

function AnimatedCard() {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardRef.current) {
      gsap.from(cardRef.current, {
        opacity: 0,
        y: 50,
        duration: 0.8,
        ease: 'power3.out'
      });
    }
  }, []);

  return (
    <div ref={cardRef} className="bg-white p-6 rounded-lg">
      Your animated content
    </div>
  );
}
```

### 5. **Use Radix UI Components**

The project has Radix UI installed (all those components in `components/ui/`):

```typescript
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

<Card className="p-6">
  <Badge variant="destructive">Scam Alert!</Badge>
  <Button onClick={() => alert('Intercepting!')}>
    Intercept Call
  </Button>
</Card>
```

---

## Design Ideas to Explore

### Layout Ideas:

**Option 1: Sidebar Layout**
```
┌─────────────────────────────────┐
│  Header                     [●] │
├───────┬─────────────────────────┤
│       │                         │
│ Side  │   Main Transcript       │
│ bar   │   Area                  │
│       │                         │
│ - Info│                         │
│ - Keys│                         │
│ - Btns│                         │
└───────┴─────────────────────────┘
```

**Option 2: Card Grid**
```
┌─────────────────────────────────┐
│  Header                     [●] │
├─────────────┬───────────────────┤
│             │                   │
│ Transcript  │   Call Info       │
│ (2 cols)    │   ┌─────────┐     │
│             │   │ Status  │     │
│             │   └─────────┘     │
│             │   ┌─────────┐     │
│             │   │Keywords │     │
│             │   └─────────┘     │
└─────────────┴───────────────────┘
```

**Option 3: Mobile-First**
```
┌─────────────┐
│   Header    │
├─────────────┤
│ Connection  │
├─────────────┤
│             │
│ Transcript  │
│             │
├─────────────┤
│  Keywords   │
├─────────────┤
│  [Buttons]  │
└─────────────┘
```

### Color Schemes:

**Dark Mode:**
```typescript
className="bg-gray-900 text-white"
// Transcript: bg-gray-800
// Cards: bg-gray-700
// Alerts: bg-red-900
```

**Light Mode (Current):**
```typescript
className="bg-gray-50"
// Transcript: bg-white
// Cards: bg-white shadow-lg
// Alerts: bg-red-50
```

**Gradient Vibes:**
```typescript
className="bg-gradient-to-br from-purple-500 via-pink-500 to-red-500"
```

### Component Ideas:

1. **Waveform Visualizer** (shows audio activity)
2. **Risk Meter** (low/medium/high scam probability)
3. **Timeline View** (chronological transcript with timestamps)
4. **Split View** (caller vs senior transcripts - future with Deepgram)
5. **Keyword Cloud** (bigger = more frequent)
6. **Action History** (log of intercepted calls)

---

## Testing Your New UI

### Test 1: Toggle Test
- Click the toggle button (top-right)
- Should switch between old and new UI
- Both should work with WebSocket

### Test 2: Live Data Test
```bash
# Make sure backend is running
cd guardian/guardian_line
python3 -m uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

- Toggle to new UI
- Call your Twilio number
- Should see transcripts appear in real-time

### Test 3: Component Test
- Create a new component
- Import and use it in `NewDashboard.tsx`
- Hot reload should work

### Test 4: Styling Test
- Change some Tailwind classes
- Should see changes immediately
- No need to refresh

---

## Common Patterns

### Pattern 1: Conditional Rendering

```typescript
{finalTranscripts.length > 0 ? (
  <TranscriptList transcripts={finalTranscripts} />
) : (
  <EmptyState message="Waiting for call..." />
)}
```

### Pattern 2: List Rendering

```typescript
{finalTranscripts.map((transcript, index) => (
  <TranscriptCard
    key={`transcript-${index}`}
    text={transcript}
    index={index}
  />
))}
```

### Pattern 3: Loading States

```typescript
const { isConnected, finalTranscripts } = useWebSocketContext();

if (!isConnected) {
  return <LoadingSpinner />;
}

return <YourContent />;
```

### Pattern 4: Error Handling

```typescript
const { error } = useWebSocketContext();

{error && (
  <Alert variant="destructive">
    <AlertTitle>Connection Error</AlertTitle>
    <AlertDescription>{error}</AlertDescription>
  </Alert>
)}
```

---

## Rules to Keep It Smooth

### ✅ DO:
- **Create new components freely** - no limits!
- **Use `useWebSocketContext()`** - it's everywhere
- **Test with real calls** - more fun than mock data
- **Experiment with layouts** - find your vibe
- **Use Tailwind classes** - fast styling
- **Toggle between UIs** - compare as you build
- **Keep components small** - easier to manage

### ❌ DON'T:
- **Don't modify `useWebSocket.ts`** - it works perfectly
- **Don't change WebSocket message format** - backend expects it
- **Don't remove WebSocketProvider** - everything breaks
- **Don't edit IPhoneSe2.tsx** - keep the old UI for reference
- **Don't hardcode URLs** - use the context

---

## When You're Done

### Final Steps:

1. **Remove the toggle button** from `App.tsx`:
```typescript
export default function App() {
  return (
    <WebSocketProvider>
      <NewDashboard />
    </WebSocketProvider>
  );
}
```

2. **Delete old UI** (optional):
```bash
rm -rf frontend/src/imports/IPhoneSe2.tsx
```

3. **Clean up unused components**:
```bash
# Keep only what you used
```

4. **Update README** with your new design

---

## Quick Reference: File Locations

```bash
# Your main canvas
frontend/src/pages/NewDashboard.tsx

# Create new components here
frontend/src/components/dashboard/

# WebSocket magic
frontend/src/contexts/WebSocketContext.tsx

# Don't touch
frontend/src/hooks/useWebSocket.ts

# Configuration
frontend/.env
```

---

## Inspiration & Resources

### UI Libraries You Can Use:
- **Tailwind CSS**: https://tailwindcss.com
- **Radix UI**: Already installed! Check `components/ui/`
- **Lucide Icons**: `npm install lucide-react`
- **Framer Motion**: `npm install framer-motion`

### Design Inspiration:
- **Linear**: Clean, minimal dashboard
- **Vercel**: Card-based layouts
- **Stripe**: Professional, trustworthy
- **Notion**: Information density

### Color Palettes:
```css
/* Trust & Safety (recommended for elder care) */
--primary: #1a7b7f (teal - current)
--danger: #dc2626 (red)
--safe: #16a34a (green)
--warning: #eab308 (yellow)

/* Modern Tech */
--primary: #8b5cf6 (purple)
--accent: #ec4899 (pink)

/* Professional */
--primary: #0ea5e9 (blue)
--accent: #6366f1 (indigo)
```

---

## Troubleshooting

### Issue: "useWebSocketContext is not a function"
**Fix**: Make sure you imported from the correct path:
```typescript
import { useWebSocketContext } from '../contexts/WebSocketContext';
```

### Issue: "Must be used within WebSocketProvider"
**Fix**: Check that `App.tsx` wraps everything in `<WebSocketProvider>`

### Issue: Transcripts not showing
**Fix**:
1. Check backend is running
2. Check browser console for WebSocket connection
3. Toggle to old UI - does it work there?

### Issue: Hot reload not working
**Fix**: Restart the frontend:
```bash
# Ctrl+C to stop, then
npm run dev
```

---

## Next Level: Add Features

Once you're vibing with the basics, try these:

### Feature 1: Call Timer
```typescript
const [duration, setDuration] = useState(0);

useEffect(() => {
  if (isConnected) {
    const timer = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }
}, [isConnected]);

// Display: {Math.floor(duration / 60)}:{duration % 60}
```

### Feature 2: Keyword Counter
```typescript
const keywordCount = finalTranscripts.reduce((count, text) => {
  const lower = text.toLowerCase();
  return count + KEYWORDS.filter(k => lower.includes(k)).length;
}, 0);
```

### Feature 3: Export Transcript
```typescript
function exportTranscript() {
  const text = finalTranscripts.join('\n\n');
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `transcript-${Date.now()}.txt`;
  a.click();
}
```

### Feature 4: Notification Sound
```typescript
useEffect(() => {
  const keywords = detectKeywords(partialTranscript);
  if (keywords.length > 0) {
    // Play alert sound
    const audio = new Audio('/alert.mp3');
    audio.play();
  }
}, [partialTranscript]);
```

---

## Summary

**You're all set!**

✅ WebSocket context is ready
✅ Toggle button lets you switch between UIs
✅ Starter template is your canvas
✅ Live data flows automatically

**Now go vibe code!** 🎨

Open `NewDashboard.tsx` and make it yours. The WebSocket will just work.

When you're stuck, check:
1. Is the toggle working?
2. Does old UI still work?
3. Is backend running?
4. Any errors in browser console?

**Have fun building!**
