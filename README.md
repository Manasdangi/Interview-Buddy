# Interview Buddy

Interview Buddy is a React + TypeScript + Vite MVP that simulates a frontend interview experience with an AI interviewer.

## Features

- Home, selection, interview room, results, and dashboard pages
- Round 1, Round 2, and System Design practice modes
- Beginner, Intermediate, and Advanced difficulty selection
- AI interviewer chat flow with follow-ups and one-question-at-a-time behavior
- Backend-powered session storage with Express and OpenAI integration
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

## Backend endpoints

- `POST /api/interviews/start`
- `POST /api/interviews/:sessionId/message`
- `POST /api/interviews/:sessionId/complete`
- `GET /api/interviews/:sessionId`
- `GET /api/interviews`

## Notes

- The OpenAI API key is loaded from `server/.env`
- Sessions are stored in memory for MVP simplicity
- Tailwind CSS is used for a dark, modern UI
