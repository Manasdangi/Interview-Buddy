# Interview Buddy

Interview Buddy is a React + TypeScript + Vite MVP that simulates a frontend interview experience with an AI interviewer.

## Features

- Home, selection, interview room, results, and dashboard pages
- Round 1, Round 2, and System Design practice modes
- Beginner, Intermediate, and Advanced difficulty selection
- AI interviewer chat flow with follow-ups and one-question-at-a-time behavior
- Gemini-powered interview responses and voice transcription
- Google sign-in with Firebase Authentication
- Firestore-backed interview history per signed-in user
- Results scorecard with evaluation and recommended topics

## Run locally

1. Copy server environment variables:

```bash
cp server/.env.example server/.env
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

## Firebase configuration

The app uses Firebase Authentication with Google sign-in and stores saved interview sessions in Firestore at:

```text
users/{uid}/sessions/{sessionId}
```

Copy `.env.example` to `.env` and fill in the Firebase web app config locally:

```bash
cp .env.example .env
```

For Vercel, add these frontend environment variables in Project Settings:

```text
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_FIREBASE_MEASUREMENT_ID
```

Deploy or paste the rules from `firestore.rules` into Firebase Console so users can only read and write their own sessions.

For deployed auth, add your deployed domain, for example `interview-buddy-flame.vercel.app`, under Firebase Authentication > Settings > Authorized domains.

## Backend endpoints

- `POST /api/interviews/start`
- `POST /api/interviews/:sessionId/message`
- `POST /api/interviews/:sessionId/complete`
- `GET /api/interviews/:sessionId`
- `GET /api/interviews`
- `POST /api/interviews/transcribe`

## Notes

- The Gemini API key is loaded from `server/.env`
- Signed-in users get Firestore history; unsigned users can still practice in the current browser flow
- Tailwind CSS is used for a dark, modern UI
