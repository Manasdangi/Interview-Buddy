import type { DailyQuestionVariant, Difficulty, InterviewType, QuestionSet } from '../types/interview'

const defaultTimeZone = 'Asia/Kolkata'

const topicBanks: Record<InterviewType, Record<Difficulty, string[]>> = {
  ROUND_1: {
    BEGINNER: [
      'JavaScript hoisting with var and let',
      'Primitive vs reference values',
      'Truthy and falsy conditions',
      'Array map/filter/reduce basics',
      'Function scope and block scope',
      'React props vs state',
      'Controlled form inputs',
      'useEffect dependency basics',
      'Rendering lists with keys',
      'Conditional rendering patterns',
      'CSS box model',
      'Flexbox alignment',
      'Semantic HTML basics',
      'Browser event bubbling',
      'DOM query and event listeners',
      'Fetch API success and error states',
      'Local component state updates',
      'Basic accessibility labels',
      'Simple debugging with console output',
      'CSS specificity basics',
    ],
    INTERMEDIATE: [
      'Closures in event handlers',
      'Promise chains vs async/await',
      'Object and array immutability',
      'Debouncing user input',
      'React state batching',
      'Derived state pitfalls',
      'Component composition',
      'Custom hook extraction',
      'useEffect cleanup',
      'Lifting state up',
      'CSS grid layout decisions',
      'Responsive image handling',
      'Form validation states',
      'API loading and retry behavior',
      'Browser storage trade-offs',
      'Event delegation',
      'Memoization basics',
      'Error boundary purpose',
      'Keyboard navigation basics',
      'Testing user interactions',
    ],
    ADVANCED: [
      'JavaScript execution context',
      'Prototype chain reasoning',
      'Microtasks vs macrotasks',
      'Deep equality trade-offs',
      'React reconciliation',
      'Concurrent rendering concepts',
      'State normalization',
      'Optimistic UI updates',
      'Complex form architecture',
      'CSS containment and layout cost',
      'Performance profiling basics',
      'Accessibility edge cases',
      'Network race conditions',
      'Caching invalidation',
      'Reusable component API design',
      'Browser rendering pipeline',
      'Hydration mismatch reasoning',
      'Testing async flows',
      'Security basics for frontend inputs',
      'Error recovery UX',
    ],
  },
  ROUND_2: {
    BEGINNER: [
      'Todo app state structure',
      'Search list filtering',
      'Pagination UI basics',
      'Modal component behavior',
      'Reusable button component',
      'Simple API data table',
      'Form submission flow',
      'Image gallery interactions',
      'Tabs component state',
      'Accordion component state',
      'Basic loading skeletons',
      'Toast notification flow',
      'Route-based page state',
      'Simple cart quantity updates',
      'Basic drag-free ordering controls',
      'Error message display',
      'Empty state design',
      'Input validation feedback',
      'Responsive card grid',
      'Basic unit test scenario',
    ],
    INTERMEDIATE: [
      'Machine coding folder structure',
      'Reusable data-fetch hook',
      'Search with debounce',
      'Infinite scroll trade-offs',
      'Client-side cache updates',
      'Complex table sorting',
      'Form wizard state',
      'Autocomplete component',
      'Accessible modal focus management',
      'Performance with large lists',
      'State management choice',
      'API cancellation',
      'Optimistic delete flow',
      'Feature flag handling',
      'Design system token usage',
      'Component testing strategy',
      'Error boundary placement',
      'Lazy loading routes',
      'File upload progress UI',
      'Retry and backoff UX',
    ],
    ADVANCED: [
      'Virtualized list architecture',
      'Collaborative editing state',
      'Offline-first machine coding',
      'Complex cache invalidation',
      'Microfrontend boundaries',
      'Performance budget enforcement',
      'State machine for UI flows',
      'Streaming data UI',
      'Undo redo architecture',
      'Real-time notification center',
      'Data grid architecture',
      'Accessible composite widgets',
      'SSR and client cache hydration',
      'Observability in frontend',
      'Build-time code splitting strategy',
      'Security review of API UI',
      'Resilient upload manager',
      'Cross-tab sync',
      'Testing flaky async interactions',
      'Designing extensible component APIs',
    ],
  },
  SYSTEM_DESIGN: {
    BEGINNER: [
      'Design a simple news feed',
      'Design a product listing page',
      'Design a basic dashboard',
      'Design a chat message list',
      'Design a video list page',
      'Design a profile page',
      'Design a settings page',
      'Design a booking flow',
      'Design a basic analytics page',
      'Design a notification panel',
      'Requirements gathering',
      'Component breakdown',
      'Simple API contracts',
      'Client state vs server state',
      'Basic loading and error states',
      'Responsive layout planning',
      'Accessibility checklist',
      'Basic caching needs',
      'Pagination design',
      'Empty state handling',
    ],
    INTERMEDIATE: [
      'Design a YouTube-style frontend',
      'Design a food delivery frontend',
      'Design a dashboard builder',
      'Design a collaborative comments UI',
      'Design a document viewer',
      'Design a ride tracking frontend',
      'Design a marketplace search experience',
      'Design a feature-rich notifications system',
      'Design a frontend analytics platform',
      'Design a multi-step checkout',
      'Data fetching architecture',
      'Cache freshness strategy',
      'Realtime update trade-offs',
      'Component ownership boundaries',
      'Performance bottleneck analysis',
      'Error recovery strategy',
      'Authentication-aware routing',
      'Design system adoption',
      'Testing architecture',
      'Observability plan',
    ],
    ADVANCED: [
      'Design Google Docs frontend',
      'Design Figma-style collaborative canvas',
      'Design high-scale video streaming UI',
      'Design an enterprise dashboard platform',
      'Design a frontend design system',
      'Design a low-latency trading UI',
      'Design a whiteboard collaboration app',
      'Design offline-first productivity UI',
      'Design a multi-tenant admin console',
      'Design a real-time incident dashboard',
      'Frontend data model scalability',
      'Realtime conflict resolution',
      'Rendering performance strategy',
      'State synchronization across tabs',
      'Security boundaries',
      'Progressive loading architecture',
      'Observability and alerting',
      'Accessibility at scale',
      'Extensibility and plugin points',
      'Migration and rollout strategy',
    ],
  },
}

function getQuestionDate(date = new Date(), timeZone = process.env.QUESTION_DAY_TIME_ZONE || defaultTimeZone) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)

  const year = parts.find((part) => part.type === 'year')?.value
  const month = parts.find((part) => part.type === 'month')?.value
  const day = parts.find((part) => part.type === 'day')?.value

  return `${year}-${month}-${day}`
}

function hashSeed(seed: string) {
  let hash = 2166136261

  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return hash >>> 0
}

export function getDailyQuestionVariant(interviewType: InterviewType, difficulty: Difficulty, questionSet: QuestionSet, date = new Date()): DailyQuestionVariant {
  const questionDate = getQuestionDate(date)
  const dailySeed = `${interviewType}:${difficulty}:SET_${questionSet}:${questionDate}`
  const topics = topicBanks[interviewType][difficulty]
  const baseIndex = hashSeed(`${interviewType}:${difficulty}:${questionDate}`) % topics.length
  const setOffset = (questionSet - 1) * 4
  const step = (hashSeed(dailySeed) % 3) + 2
  const topicPath = Array.from({ length: 5 }, (_, index) => topics[(baseIndex + setOffset + index * step) % topics.length])

  return {
    questionDate,
    dailySeed,
    topicPath,
  }
}
