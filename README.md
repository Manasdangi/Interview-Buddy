# Interview Buddy

Interview Buddy is a React + TypeScript + Vite MVP that simulates a frontend interview experience with an AI interviewer.

## Features

- Home, selection, interview room, results, and dashboard pages
- Round 1, Round 2, and System Design practice modes
- Beginner, Intermediate, and Advanced difficulty selection
- Five question-set variants for every difficulty level
- AI interviewer chat flow with follow-ups and one-question-at-a-time behavior
- Backend-powered session storage with Express and OpenAI integration
- Results scorecard with evaluation and recommended topics

## Run locally

1. Copy server environment variables:

```bash
cp server/.env.example server/.env
```

For Google sign-in, also copy the frontend environment placeholders:

```bash
cp .env.example .env
```

2. Install dependencies:

```bash
npm install
cd server && npm install
```

3. Start the backend API:

```bash
cd server && npm run dev
```

4. Start the frontend app:

```bash
cd .. && npm run dev
```

5. Open the app in your browser at `http://localhost:5173`

## Backend configuration

The Gemini API key is loaded from `server/.env` as `GEMINI_API_KEY`.

Interview sessions are persisted to Firestore when Firebase Admin credentials are configured. For local development, copy `server/.env.example` to `server/.env` and fill one of these credential options:

- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY`
- `FIREBASE_SERVICE_ACCOUNT_JSON`
- `FIREBASE_SERVICE_ACCOUNT_BASE64`

On Vercel, add the same values in Project Settings > Environment Variables. If Firebase credentials are not configured, the backend falls back to in-memory sessions.

The frontend Firebase web config is loaded from `VITE_FIREBASE_*` environment variables. These values enable Google sign-in in the browser. The private Firebase Admin credentials stay server-side only.

## Backend endpoints

- `POST /api/interviews/start`
- `POST /api/interviews/:sessionId/message`
- `POST /api/interviews/:sessionId/complete`
- `GET /api/interviews/:sessionId`
- `GET /api/interviews`

## Notes

- The Gemini API key is loaded from `server/.env`
- Firestore stores interview sessions when Firebase Admin credentials are configured
- Tailwind CSS is used for a dark, modern UI
