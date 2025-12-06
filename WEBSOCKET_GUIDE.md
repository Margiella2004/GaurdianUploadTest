# WebSocket Architecture Guide - Guardian App

## Overview

Your teammate is right - **the WebSocket connection is currently fragile** because it's tightly coupled to the UI layout. This guide explains how it works and how to make it robust for your redesign.

---

## Current Architecture

### The 3 Key Components

```
┌─────────────────────┐
│  useWebSocket Hook  │  ← Core logic (KEEP THIS!)
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│ TranscriptDisplay   │  ← Receives data & displays
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│   IPhoneSe2.tsx     │  ← Hardcoded URL (PROBLEM!)
└─────────────────────┘
```

---

## Component Breakdown

### 1. **useWebSocket Hook** (`src/hooks/useWebSocket.ts`)

**What it does:**
- Creates and manages WebSocket connection
- Handles auto-reconnection (every 3 seconds)
- Parses incoming messages
- Separates partial vs final transcripts
- Tracks connection state

**Key State Variables:**
```typescript
{
  isConnected: boolean,        // Connection status
  partialTranscript: string,   // Real-time, incomplete text
  finalTranscripts: string[],  // Array of completed sentences
  error: string | null         // Error messages
}
```

**Message Format from Backend:**
```typescript
// Partial - sent character by character as person speaks
{ type: "partial", text: "Hello" }

// Final - sent when person finishes speaking
{ type: "final", text: "Hello this is the police." }
```

**This is STABLE** - don't modify this unless fixing bugs.

---

### 2. **TranscriptDisplay Component** (`src/components/TranscriptDisplay.tsx`)

**What it does:**
- Uses the `useWebSocket` hook
- Displays transcripts in a styled UI
- Highlights scam keywords (police, bank account, etc.)
- Auto-scrolls to new messages
- Shows connection status

**Props:**
```typescript
interface TranscriptDisplayProps {
  websocketUrl: string;  // WebSocket URL to connect to
}
```

**Key Features:**
- **Keyword Detection**: Scans text for 50+ scam-related words
- **Highlighting**: Colors detected keywords pink
- **Auto-scroll**: Scrolls to bottom on new messages
- **Connection Indicator**: Green dot when connected

**This is SOMEWHAT FRAGILE** - it has hardcoded positioning.

---

### 3. **IPhoneSe2.tsx** (Main UI Component)

**The Problem:**
```typescript
// Line 11 - HARDCODED!
const WEBSOCKET_URL = "ws://localhost:8000/frontend-stream";
```

This URL is:
- ✅ Correct for local development
- ❌ Won't work in production
- ❌ Can't be changed without editing code
- ❌ Different from ngrok URL

**Current Usage:**
```typescript
// IPhoneSe2.tsx doesn't directly use WebSocket
// It just renders TranscriptDisplay somewhere in the component tree
<TranscriptDisplay websocketUrl={WEBSOCKET_URL} />
```

---

## Why It's Fragile

### Problem 1: Hardcoded WebSocket URL
**Location**: `IPhoneSe2.tsx` line 11

**Issue**: The URL is hardcoded in the component file. If you need to:
- Deploy to production
- Change backend server
- Use different port
- Switch between ngrok/localhost

You have to **manually edit the code**.

**Solution**: Use environment variables!

---

### Problem 2: Tight Coupling to Layout
**Location**: `TranscriptDisplay.tsx` lines 131-142

```typescript
style={{
  position: 'absolute',
  top: '180px',       // ← Hardcoded position!
  left: '19px',       // ← Hardcoded position!
  width: '283px',     // ← Hardcoded size!
  height: '255px',    // ← Hardcoded size!
  // ... more hardcoded styles
}}
```

**Issue**: The transcript display is positioned absolutely with pixel values. If you change the layout, these values break.

**Why this happened**: Likely exported from Figma/design tool with exact positioning.

---

### Problem 3: Component Mixing Concerns
**Location**: `IPhoneSe2.tsx`

The file contains:
- ✅ WebSocket URL constant
- ✅ UI layout components (Frame19, Frame26, etc.)
- ✅ GSAP animations
- ❌ All mixed together!

**Issue**: Hard to find and modify WebSocket-related code when it's buried in 400+ lines of UI components.

---

## How to Make It Bulletproof

### Solution 1: Environment Variables for WebSocket URL

#### Step 1: Create `.env` file in frontend root

```bash
# /guardian/frontend/.env
VITE_WEBSOCKET_URL=ws://localhost:8000/frontend-stream
```

#### Step 2: Update `IPhoneSe2.tsx`

**Replace line 11:**
```typescript
// OLD (hardcoded)
const WEBSOCKET_URL = "ws://localhost:8000/frontend-stream";

// NEW (environment variable)
const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL || "ws://localhost:8000/frontend-stream";
```

#### Step 3: For production, create `.env.production`

```bash
# /guardian/frontend/.env.production
VITE_WEBSOCKET_URL=wss://your-production-domain.com/frontend-stream
```

**Benefits:**
- ✅ Easy to change without code edits
- ✅ Different URLs for dev/production
- ✅ Fallback to localhost if not set
- ✅ Can be set by environment (Docker, Vercel, etc.)

---

### Solution 2: Decouple Layout from TranscriptDisplay

**Current Problem:** `TranscriptDisplay` has hardcoded absolute positioning.

**Option A: Make TranscriptDisplay Layout-Agnostic** (Recommended)

Remove the `position: absolute` and hardcoded dimensions from `TranscriptDisplay.tsx`:

```typescript
// TranscriptDisplay.tsx - line 131
// Remove the outer absolute positioning div
// Keep only the internal styling (colors, borders, etc.)

export function TranscriptDisplay({ websocketUrl }: TranscriptDisplayProps) {
  const { isConnected, partialTranscript, finalTranscripts, error } = useWebSocket(websocketUrl);

  return (
    <div
      style={{
        // Remove: position, top, left, width, height
        // Keep: backgroundColor, borderRadius, boxShadow, etc.
        backgroundColor: '#1a7b7f',
        borderRadius: '16px',
        boxShadow: '0px 10px 15px -3px rgba(0,0,0,0.1)',
        width: '100%',  // ← Responsive!
        height: '100%', // ← Responsive!
      }}
    >
      {/* Rest of component */}
    </div>
  );
}
```

Then in your new layout, position it how you want:

```typescript
// Your new layout component
<div style={{ position: 'absolute', top: '200px', left: '50px', width: '300px', height: '400px' }}>
  <TranscriptDisplay websocketUrl={WEBSOCKET_URL} />
</div>
```

**Option B: Accept Position Props**

Add props to control positioning:

```typescript
interface TranscriptDisplayProps {
  websocketUrl: string;
  className?: string;  // ← New!
  style?: React.CSSProperties;  // ← New!
}

export function TranscriptDisplay({ websocketUrl, className, style }: TranscriptDisplayProps) {
  return (
    <div
      className={className}
      style={{
        backgroundColor: '#1a7b7f',
        borderRadius: '16px',
        ...style  // ← Allows override
      }}
    >
      {/* ... */}
    </div>
  );
}
```

Usage:
```typescript
<TranscriptDisplay
  websocketUrl={WEBSOCKET_URL}
  style={{ position: 'absolute', top: '100px', left: '20px' }}
/>
```

---

### Solution 3: Separate Concerns with Context

**Best for large redesigns:**

Create a WebSocket context that any component can access:

#### Step 1: Create `WebSocketContext.tsx`

```typescript
// src/contexts/WebSocketContext.tsx
import { createContext, useContext, ReactNode } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

interface WebSocketContextType {
  isConnected: boolean;
  partialTranscript: string;
  finalTranscripts: string[];
  error: string | null;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL || "ws://localhost:8000/frontend-stream";
  const wsData = useWebSocket(WEBSOCKET_URL);

  return (
    <WebSocketContext.Provider value={wsData}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketContext() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within WebSocketProvider');
  }
  return context;
}
```

#### Step 2: Wrap your app

```typescript
// src/main.tsx or App.tsx
import { WebSocketProvider } from './contexts/WebSocketContext';

function App() {
  return (
    <WebSocketProvider>
      {/* Your entire app */}
    </WebSocketProvider>
  );
}
```

#### Step 3: Use anywhere in your app

```typescript
// Any component, anywhere
import { useWebSocketContext } from '../contexts/WebSocketContext';

function MyNewLayout() {
  const { isConnected, finalTranscripts } = useWebSocketContext();

  return (
    <div>
      <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
      <p>Messages: {finalTranscripts.length}</p>
    </div>
  );
}
```

**Benefits:**
- ✅ Single WebSocket connection for entire app
- ✅ Any component can access transcript data
- ✅ Completely decoupled from layout
- ✅ Easy to create multiple views of same data

---

## Step-by-Step Redesign Plan

### Phase 1: Make It Environment-Based
1. Create `.env` file with `VITE_WEBSOCKET_URL`
2. Update `IPhoneSe2.tsx` to use env variable
3. Test that it still works

### Phase 2: Decouple TranscriptDisplay
1. Remove absolute positioning from `TranscriptDisplay`
2. Make it take `className` and `style` props
3. Test in current layout

### Phase 3: Create New Layout
1. Build your new UI components
2. Position `TranscriptDisplay` wherever you want
3. Keep existing functionality

### Phase 4 (Optional): Add Context
1. Create `WebSocketContext`
2. Wrap app with provider
3. Create new components that consume context
4. Gradually migrate from prop drilling

---

## Critical Rules When Redesigning

### ✅ DO:
- **Keep the `useWebSocket` hook unchanged** - it's solid
- **Pass `websocketUrl` as a prop** - maintains flexibility
- **Use environment variables** - makes deployment easier
- **Test WebSocket connection separately** - before styling
- **Check browser console** - for connection logs
- **Keep auto-reconnect logic** - prevents manual refreshes

### ❌ DON'T:
- **Don't modify WebSocket message format** - backend expects specific format
- **Don't remove error handling** - you need to know when it breaks
- **Don't hardcode URLs** - use environment variables
- **Don't remove `reconnectTimeoutRef`** - handles disconnects
- **Don't skip cleanup in useEffect** - causes memory leaks
- **Don't change the `ws://localhost:8000` protocol to `wss://`** for local development

---

## Testing Your Changes

### Test 1: WebSocket Connection
```typescript
// Add this temporarily to see connection status
console.log('WebSocket Status:', isConnected);
console.log('Transcripts:', finalTranscripts);
```

### Test 2: Backend Running
```bash
# Terminal: Check backend is running
curl http://localhost:8000/incoming-call
# Should return: Method Not Allowed (expected)
```

### Test 3: Browser Console
Open DevTools → Console, look for:
- ✅ `🟢 Connected to backend WebSocket`
- ❌ `❌ WebSocket error:` (bad!)
- ❌ `🔴 WebSocket disconnected` (reconnecting is OK)

### Test 4: Live Call
1. Call your Twilio number
2. Watch backend terminal for transcription logs
3. Watch browser for transcripts appearing
4. Check if keywords are highlighted

---

## Quick Reference: WebSocket Flow

```
1. Component mounts
   ↓
2. useWebSocket hook creates WebSocket connection
   ↓
3. WebSocket connects to ws://localhost:8000/frontend-stream
   ↓
4. Backend accepts connection, adds to frontend_clients set
   ↓
5. When call happens:
   - Twilio → Backend → OpenAI → Transcription
   ↓
6. Backend broadcasts to all frontend_clients
   ↓
7. Frontend receives message { type: "partial", text: "..." }
   ↓
8. useWebSocket parses and updates state
   ↓
9. Component re-renders with new transcript
   ↓
10. User sees text appear in real-time!
```

---

## Common Issues During Redesign

### Issue: "WebSocket won't connect after layout change"
**Cause**: Probably changed the URL or removed the component
**Fix**: Check `websocketUrl` prop is still passed correctly

### Issue: "Transcripts appear but disappear immediately"
**Cause**: Component is unmounting/remounting
**Fix**: Check for keys on list items, or move state up to parent

### Issue: "Multiple WebSocket connections opening"
**Cause**: Component rendering multiple times
**Fix**: Use React DevTools → Components to check render count
**Solution**: Lift WebSocket to a Context or parent component

### Issue: "Works on localhost but not in production"
**Cause**: Hardcoded `ws://localhost:8000`
**Fix**: Use environment variables with different URLs for prod

### Issue: "Connection drops after a few minutes"
**Cause**: ngrok free tier timeout (2 hours)
**Fix**: Restart ngrok, update env variable, restart backend

---

## Example: Clean Redesign Pattern

Here's the cleanest way to redesign:

```typescript
// src/App.tsx
import { WebSocketProvider } from './contexts/WebSocketContext';
import { NewLayout } from './components/NewLayout';

export default function App() {
  return (
    <WebSocketProvider>
      <NewLayout />
    </WebSocketProvider>
  );
}
```

```typescript
// src/components/NewLayout.tsx
import { useWebSocketContext } from '../contexts/WebSocketContext';
import { TranscriptCard } from './TranscriptCard';
import { KeywordBadges } from './KeywordBadges';
import { ConnectionStatus } from './ConnectionStatus';

export function NewLayout() {
  const { isConnected, finalTranscripts, partialTranscript } = useWebSocketContext();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Guardian Dashboard</h1>
          <ConnectionStatus isConnected={isConnected} />
        </header>

        <div className="grid grid-cols-2 gap-6">
          <TranscriptCard
            transcripts={finalTranscripts}
            partial={partialTranscript}
          />
          <KeywordBadges transcripts={finalTranscripts} />
        </div>
      </div>
    </div>
  );
}
```

**Benefits:**
- ✅ Completely new layout
- ✅ Same WebSocket connection
- ✅ Reusable components
- ✅ No hardcoded positioning
- ✅ Responsive design
- ✅ Easy to test and modify

---

## Summary

**The WebSocket is fragile because:**
1. URL is hardcoded
2. UI components have absolute positioning
3. Everything is mixed together

**Make it bulletproof by:**
1. Using environment variables for URLs
2. Decoupling layout from data components
3. Using Context for app-wide access
4. Keeping the `useWebSocket` hook unchanged

**When redesigning:**
- Keep the WebSocket logic separate
- Test connection before styling
- Use environment variables
- Make components layout-agnostic

Follow this guide and your WebSocket will be rock-solid regardless of how you redesign the UI!
