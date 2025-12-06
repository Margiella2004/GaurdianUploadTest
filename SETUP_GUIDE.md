# Guardian App - Complete Setup Guide

## Overview

**Guardian** is a real-time call transcription system designed to protect seniors from scam calls. Built for the BridgeGood 2025 AI for Social Good hackathon, it uses OpenAI's Realtime API to transcribe phone conversations in real-time, highlighting suspicious keywords that may indicate a scam attempt.

### How It Works

1. **Phone Call Flow**: When someone calls the Twilio number, Twilio streams the audio to your backend server via WebSocket
2. **Real-time Transcription**: The backend forwards the audio to OpenAI's Realtime API, which transcribes the conversation using the `gpt-4o-transcribe` model
3. **Live Dashboard**: Caregivers see the transcription appear in real-time on a web dashboard, with scam-related keywords highlighted
4. **Protection**: Caregivers can intercept the call if they detect suspicious activity

### Technology Stack

- **Frontend**: React + Vite + TypeScript (with Radix UI components)
- **Backend**: FastAPI + WebSockets (Python)
- **Phone Service**: Twilio (for receiving calls and streaming audio)
- **Transcription**: OpenAI Realtime API (`gpt-4o-transcribe`)
- **Tunneling**: ngrok (to expose local backend to Twilio)

---

## Prerequisites

Before starting, ensure you have these installed:

1. **Python 3.9+**: `python3 --version`
2. **Node.js 18+**: `node --version`
3. **npm**: `npm --version`
4. **ngrok**: Download from https://ngrok.com/download

### Required Accounts & API Keys

1. **Twilio Account** (https://www.twilio.com)
   - Sign up for free trial ($15 credit)
   - Get: Account SID, Auth Token
   - Buy a phone number with Voice capability (~$1/month)

2. **OpenAI Account** (https://platform.openai.com)
   - Add payment method (required for API access)
   - Create API key (starts with `sk-`)

3. **ngrok Account** (https://ngrok.com)
   - Sign up for free
   - Get auth token from dashboard

---

## Initial Setup

### Step 1: Install Dependencies

#### Install Python packages:
```bash
cd "/path/to/Gaurdian App/guardian"
pip3 install -r requirements.txt
```

#### Install Node packages:
```bash
cd "/path/to/Gaurdian App/guardian/frontend"
npm install
```

### Step 2: Authenticate ngrok

Run this once to authenticate ngrok with your account:
```bash
ngrok config add-authtoken YOUR_NGROK_AUTH_TOKEN
```

### Step 3: Configure Environment Variables

Create the `.env` file:
```bash
cd "/path/to/Gaurdian App/guardian/guardian_line"
cp .env.example .env
```

Edit `.env` with your credentials:
```env
NGROK_DOMAIN=your-ngrok-domain.ngrok-free.app
SENIOR_NUMBER=+1234567890

TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+18333097560

OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
```

**Note**: Leave `NGROK_DOMAIN` empty for now - you'll fill it in after starting ngrok.

---

## Running the Application

You need **3 terminal windows** running simultaneously:

### Terminal 1: Start ngrok

```bash
ngrok http 8000
```

**Copy the forwarding domain** (e.g., `abc-xyz-123.ngrok-free.app`)

**Important**:
1. Update your `.env` file with the `NGROK_DOMAIN`
2. Update the WebSocket URL in `/guardian/frontend/src/imports/IPhoneSe2.tsx` if needed
3. Configure Twilio webhook (see below)

### Terminal 2: Start Backend Server

```bash
cd "/path/to/Gaurdian App/guardian/guardian_line"
python3 -m uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

**Expected output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

### Terminal 3: Start Frontend

```bash
cd "/path/to/Gaurdian App/guardian/frontend"
npm run dev
```

**Expected output:**
```
VITE v6.3.5  ready in xxx ms
➜  Local:   http://localhost:5173/
```

### Step 4: Configure Twilio Webhook

1. Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/incoming
2. Click on your Twilio phone number
3. Scroll to **"Voice Configuration"**
4. Under **"A CALL COMES IN"**, set:
   - URL: `https://your-ngrok-domain.ngrok-free.app/incoming-call`
   - Method: **HTTP POST**
5. Click **Save Configuration**

### Step 5: Test the Application

1. Open browser to: http://localhost:5173
2. Call your Twilio number from your phone
3. You should hear: "Start talking now"
4. Start speaking - watch the transcription appear in real-time!

---

## Common Errors & Solutions

### Error 1: `command not found: uvicorn`
**Problem**: uvicorn not in PATH
**Solution**: Run using Python module:
```bash
python3 -m uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

### Error 2: `No matching distribution found for click==8.3.1`
**Problem**: Package version incompatibility with Python 3.9
**Solution**: We fixed this by changing `click==8.3.1` to `click==8.1.8` in `requirements.txt`

### Error 3: Twilio says "Application Error"
**Problem**: Twilio can't reach your backend
**Causes**:
- ngrok not running
- Wrong ngrok domain in Twilio webhook
- Backend server not running

**Solution**:
1. Verify ngrok is running and shows "Session Status: online"
2. Check Twilio webhook URL matches your current ngrok domain
3. Test backend: http://localhost:8000/incoming-call (should show "Method Not Allowed")

### Error 4: WebSocket Connection Failed
**Problem**: Frontend can't connect to backend
**Original issue**: Trying to connect through ngrok with `wss://` protocol
**Solution**: Changed WebSocket URL to connect directly to localhost:
```typescript
const WEBSOCKET_URL = "ws://localhost:8000/frontend-stream";
```

### Error 5: ngrok domain changes from `.de` to `.dev`
**Problem**: Free ngrok domains can change slightly
**Solution**:
1. Update `.env` file with new domain
2. Restart backend server
3. Update Twilio webhook URL

### Error 6: Transcription works but not showing in frontend
**Problem**: Frontend WebSocket connecting to wrong URL
**Solution**: Updated `IPhoneSe2.tsx` with correct WebSocket URL pointing to localhost

---

## Architecture Details

### Backend Flow (`server.py`)

1. **Incoming Call Endpoint** (`/incoming-call`):
   - Twilio calls this when someone dials your number
   - Returns TwiML XML that tells Twilio to stream audio to `/media-stream`

2. **Media Stream WebSocket** (`/media-stream`):
   - Receives audio from Twilio in μ-law format
   - Forwards audio to OpenAI Realtime API
   - Receives transcription chunks (partial and final)
   - Broadcasts transcription to all connected frontend clients

3. **Frontend WebSocket** (`/frontend-stream`):
   - Allows frontend clients to connect
   - Receives transcription broadcasts from media stream handler
   - Sends both partial (real-time) and final (completed) transcripts

### Frontend Flow

1. **WebSocket Connection**: Connects to backend at `ws://localhost:8000/frontend-stream`
2. **Receive Transcripts**: Listens for messages with type `partial` or `final`
3. **Display**: Shows transcription in real-time with scam keyword highlighting
4. **Auto-reconnect**: Attempts to reconnect if connection drops

### Data Flow Diagram

```
Phone Call → Twilio → ngrok → Backend (/media-stream)
                                   ↓
                              OpenAI API
                                   ↓
                         Transcription Results
                                   ↓
                            Backend broadcasts
                                   ↓
                         Frontend (WebSocket)
                                   ↓
                          Browser Dashboard
```

---

## File Structure

```
guardian/
├── guardian_line/           # Backend
│   ├── server.py           # Main FastAPI server
│   ├── config.py           # Configuration loader
│   ├── .env                # Environment variables
│   └── .env.example        # Environment template
├── frontend/               # Frontend
│   ├── src/
│   │   ├── App.tsx         # Main app component
│   │   ├── imports/
│   │   │   └── IPhoneSe2.tsx     # Main UI with WebSocket
│   │   ├── hooks/
│   │   │   └── useWebSocket.ts   # WebSocket hook
│   │   └── components/
│   │       └── TranscriptDisplay.tsx
│   └── package.json
├── requirements.txt        # Python dependencies
├── package.json           # Root package.json
└── README.md              # Original README
```

---

## Quick Start Checklist

- [ ] Install Python 3.9+, Node.js, npm, ngrok
- [ ] Sign up for Twilio, OpenAI, ngrok accounts
- [ ] Install Python dependencies: `pip3 install -r requirements.txt`
- [ ] Install frontend dependencies: `cd frontend && npm install`
- [ ] Authenticate ngrok: `ngrok config add-authtoken YOUR_TOKEN`
- [ ] Create `.env` file from `.env.example`
- [ ] Start ngrok: `ngrok http 8000`
- [ ] Update `.env` with ngrok domain
- [ ] Start backend: `python3 -m uvicorn server:app --host 0.0.0.0 --port 8000 --reload`
- [ ] Start frontend: `cd frontend && npm run dev`
- [ ] Configure Twilio webhook with ngrok URL
- [ ] Test by calling your Twilio number

---

## Future Improvements

### Recommended: Switch to Deepgram for Speaker Diarization

Currently using OpenAI Realtime API, which provides excellent transcription but **cannot distinguish between multiple speakers**. For scam detection, it's critical to know who's speaking (the senior vs. the caller).

**Why Deepgram?**
- Real-time speaker diarization (identifies "Speaker 0" vs "Speaker 1")
- Similar WebSocket architecture (easy migration)
- Low latency (~300ms)
- Built-in keyword spotting for scam phrases

**Implementation would require**:
1. Replace OpenAI WebSocket connection with Deepgram
2. Update audio format handling
3. Parse speaker labels in transcription results
4. Update frontend to show which speaker is talking

---

## Troubleshooting

### Backend not receiving calls
- Check ngrok is running: Look for "Session Status: online"
- Verify Twilio webhook URL is correct and uses HTTPS
- Test directly: `curl https://your-domain.ngrok-free.app/incoming-call`

### Transcription not working
- Check OpenAI API key is valid
- Verify you have credits in OpenAI account
- Look for errors in backend terminal
- Check backend logs for OpenAI connection errors

### Frontend can't connect
- Ensure backend is running on port 8000
- Check browser console for WebSocket errors
- Verify WebSocket URL is `ws://localhost:8000/frontend-stream`
- Check CORS settings in `server.py`

### ngrok tunnel expired
- Free ngrok tunnels expire after 2 hours
- Restart ngrok to get a new tunnel
- Update `.env` with new domain
- Update Twilio webhook URL
- Restart backend server

---

## Support & Contributing

This project was built for the BridgeGood 2025 hackathon to help protect seniors from scam calls.

For issues or questions:
1. Check this guide's troubleshooting section
2. Review the error messages in terminal windows
3. Verify all services are running (ngrok, backend, frontend)

---

## License

Built with love for social good.
