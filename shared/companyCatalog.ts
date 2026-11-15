/**
 * Company mock-interview catalog, shared by the frontend (company pages) and the backend (interview prompts).
 *
 * Each round is a "blueprint": the format, focus areas and interviewer style that candidates commonly report
 * for that company's frontend loop. Topics are original practice themes written for this app, not leaked or
 * verbatim questions. Interview Buddy is not affiliated with or endorsed by any company listed here.
 */

export type CompanyRoundType = 'ROUND_1' | 'ROUND_2' | 'SYSTEM_DESIGN'

export type CompanyRoleLevel = 'FE1' | 'FE2'

export type CompanyCategory = 'AI' | 'BIG_TECH' | 'INDIAN_PRODUCT' | 'FINTECH' | 'SAAS_ENTERPRISE' | 'STARTUP'

export type CompanyRoundBlueprint = {
  type: CompanyRoundType
  /** How the round is usually named for this company, e.g. "Machine coding". */
  title: string
  durationMinutes: number
  /** One or two sentences on how the round runs. */
  format: string
  /** How this company's interviewers tend to behave in the round. */
  interviewerStyle: string
  /** Practice themes; a different subset is used for each attempt. */
  topics: string[]
  /** Asked as the final topic of the round when present (e.g. Amazon Leadership Principles). */
  behavioralTopic?: string
}

export type Company = {
  id: string
  name: string
  category: CompanyCategory
  tagline: string
  /** Hiring-bar and culture notes the interviewer should keep in mind. */
  bar: string
  rounds: CompanyRoundBlueprint[]
}

export type RoleDefinition = {
  level: CompanyRoleLevel
  label: string
  shortLabel: string
  experience: string
  difficulty: 'INTERMEDIATE' | 'ADVANCED'
  expectations: string
}

export const roleDefinitions: Record<CompanyRoleLevel, RoleDefinition> = {
  FE1: {
    level: 'FE1',
    label: 'Frontend Engineer 1 (SDE-1)',
    shortLabel: 'Frontend Engineer 1',
    experience: '0–2 years',
    difficulty: 'INTERMEDIATE',
    expectations:
      'Solid JavaScript, React and CSS fundamentals, clean working code, and the ability to explain choices. Not expected to own large-scale architecture.',
  },
  FE2: {
    level: 'FE2',
    label: 'Frontend Engineer 2 (SDE-2)',
    shortLabel: 'Frontend Engineer 2',
    experience: '2–5 years',
    difficulty: 'ADVANCED',
    expectations:
      'Deep JavaScript and React internals, production-quality machine coding, performance and accessibility awareness, and owning the frontend design of a feature end to end with clear trade-offs.',
  },
}

export const companyCategoryLabels: Record<CompanyCategory, string> = {
  AI: 'AI companies',
  BIG_TECH: 'Big Tech',
  INDIAN_PRODUCT: 'Indian product',
  FINTECH: 'Fintech & banking',
  SAAS_ENTERPRISE: 'SaaS & enterprise',
  STARTUP: 'Top startups',
}

export const roundTypeLabels: Record<CompanyRoundType, string> = {
  ROUND_1: 'Fundamentals',
  ROUND_2: 'Coding / machine coding',
  SYSTEM_DESIGN: 'Frontend system design',
}

// Shared blocks, extended per company so each loop keeps its own flavour.
const jsCore = [
  'Closures and lexical scope in a real UI bug',
  'Event loop: microtasks vs macrotasks output reasoning',
  'this binding in callbacks, arrow functions and classes',
  'Promises: implement a Promise.all-style helper',
  'Debounce vs throttle: implement one and explain where to use it',
  'Prototypal inheritance and how classes desugar',
  'Shallow vs deep copy and structuredClone trade-offs',
  'Event bubbling, capturing and delegation',
]

const reactCore = [
  'React reconciliation and why keys matter',
  'useEffect dependencies, cleanup and stale closures',
  'useMemo / useCallback / React.memo: when they help and when they do not',
  'Lifting state vs context vs an external store',
  'Controlled vs uncontrolled forms and validation',
  'Custom hook design for data fetching with loading and error states',
]

const cssCore = [
  'CSS specificity and the cascade in a conflicting-style bug',
  'Flexbox vs grid for a responsive layout',
  'Critical rendering path: what blocks first paint',
]

const machineCodingCore = [
  'Autocomplete / typeahead with debounced search and keyboard navigation',
  'Infinite scroll feed with loading, error and end-of-list states',
  'Nested comments / file explorer tree with expand and collapse',
  'Star rating or OTP input component with accessibility',
  'Tabs or accordion component with a reusable API',
  'Paginated, sortable, filterable data table',
  'Modal / dialog with focus trap and escape handling',
  'Image carousel with autoplay and controls',
]

const systemDesignCore = [
  'Requirements and scope: what to clarify before designing',
  'Component architecture and state ownership',
  'Data fetching, caching and invalidation strategy',
  'Rendering strategy: CSR vs SSR vs SSG vs streaming',
  'Performance budget: bundle splitting, images, Core Web Vitals',
  'Real-time updates: polling vs SSE vs WebSockets',
  'Offline support and optimistic updates',
  'Accessibility, internationalisation and observability',
]

function pick(base: string[], count: number, offset = 0) {
  return Array.from({ length: Math.min(count, base.length) }, (_, index) => base[(index + offset) % base.length])
}

const curatedCompanies: Company[] = [
  {
    id: 'amazon',
    name: 'Amazon',
    category: 'BIG_TECH',
    tagline: 'Problem solving, frontend coding and Leadership Principles in every round.',
    bar: 'Each round pairs technical depth with one Leadership Principles story; candidates are expected to answer behaviourals in STAR format with measurable outcomes. A "Bar Raiser" checks that the hire raises the team average.',
    rounds: [
      {
        type: 'ROUND_1',
        title: 'Problem solving in JavaScript',
        durationMinutes: 60,
        format: 'A data-structures style problem solved in JavaScript, then JavaScript fundamentals follow-ups.',
        interviewerStyle: 'Wants you to clarify the problem, state an approach and its complexity before coding, then test with examples.',
        topics: [
          'Array / string problem in JavaScript with time and space complexity',
          'Hash map based problem (grouping, counting, two-sum style)',
          'Flatten a deeply nested array or object without recursion limits',
          'Implement an event emitter (on, off, emit, once)',
          ...pick(jsCore, 5),
        ],
        behavioralTopic: 'Leadership Principle: Customer Obsession or Ownership — a story in STAR format',
      },
      {
        type: 'ROUND_2',
        title: 'Frontend coding (UI build)',
        durationMinutes: 60,
        format: 'Build a small UI widget, often in plain JavaScript/DOM or React, then discuss accessibility and performance.',
        interviewerStyle: 'Cares about working code, clean structure and how you handle edge cases; asks you to extend the feature midway.',
        topics: [
          ...pick(machineCodingCore, 6),
          'Build a widget with vanilla DOM APIs (no framework) and explain event delegation',
          'Accessible form with inline validation messages',
        ],
        behavioralTopic: 'Leadership Principle: Dive Deep or Bias for Action — a story in STAR format',
      },
      {
        type: 'SYSTEM_DESIGN',
        title: 'Frontend system design',
        durationMinutes: 60,
        format: 'Design the frontend of a large-scale product surface end to end.',
        interviewerStyle: 'Pushes on scale, latency for a global audience and operational concerns like metrics and rollbacks.',
        topics: [
          'Design a product detail page for a large e-commerce site',
          'Design a shopping cart that stays in sync across devices',
          'Design a frontend for a video streaming catalogue',
          ...pick(systemDesignCore, 6),
        ],
        behavioralTopic: 'Leadership Principle: Think Big or Deliver Results — a story in STAR format',
      },
    ],
  },
  {
    id: 'google',
    name: 'Google',
    category: 'BIG_TECH',
    tagline: 'Algorithmic rigour plus web fundamentals done properly.',
    bar: 'Strong emphasis on structured problem solving, clean code without an IDE, and explaining complexity. Front-end domain rounds probe web platform knowledge deeply. "Googleyness" covers collaboration and handling ambiguity.',
    rounds: [
      {
        type: 'ROUND_1',
        title: 'Coding & web fundamentals',
        durationMinutes: 45,
        format: 'An algorithmic problem in JavaScript followed by web platform questions.',
        interviewerStyle: 'Gives hints sparingly, expects you to optimise from brute force and to write bug-free code.',
        topics: [
          'Graph or tree traversal problem in JavaScript',
          'Interval merging or scheduling problem',
          'Implement a LRU cache',
          'DOM tree problem: find the lowest common ancestor of two nodes',
          ...pick(jsCore, 4, 1),
          'How the browser parses HTML, CSS and JS into pixels',
        ],
      },
      {
        type: 'ROUND_2',
        title: 'Front-end domain coding',
        durationMinutes: 45,
        format: 'Build a UI component or utility with a focus on web APIs, accessibility and correctness.',
        interviewerStyle: 'Probes why you chose an API, how it behaves in edge cases and how you would test it.',
        topics: [
          ...pick(machineCodingCore, 5, 2),
          'Implement a virtualised list for 100k rows',
          'Build a component that is fully keyboard and screen-reader accessible',
          'Implement a simple client-side router using the History API',
        ],
      },
      {
        type: 'SYSTEM_DESIGN',
        title: 'Frontend architecture',
        durationMinutes: 45,
        format: 'Design a complex web application and defend the trade-offs.',
        interviewerStyle: 'Expects you to drive the discussion, quantify scale and cover performance and accessibility unprompted.',
        topics: [
          'Design a collaborative document editor frontend',
          'Design a maps-style app with tiles and search',
          'Design an email client with offline support',
          ...pick(systemDesignCore, 6, 1),
        ],
        behavioralTopic: 'Googleyness: a time you handled ambiguity or disagreement on a team',
      },
    ],
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    category: 'BIG_TECH',
    tagline: 'DSA-heavy loops with JS/React depth and design for SDE-2.',
    bar: 'Several back-to-back rounds; typically data structures plus a domain round. A final "as appropriate" round with a senior leader checks overall fit and growth mindset.',
    rounds: [
      {
        type: 'ROUND_1',
        title: 'DSA & JavaScript',
        durationMinutes: 60,
        format: 'One or two data-structure problems in JavaScript and core JS concepts.',
        interviewerStyle: 'Friendly but thorough; asks you to dry-run your code and handle edge cases.',
        topics: [
          'Linked list or stack problem in JavaScript',
          'String manipulation with edge cases (unicode, empty input)',
          'Binary search variant',
          'Implement Function.prototype.bind polyfill',
          ...pick(jsCore, 5, 2),
        ],
      },
      {
        type: 'ROUND_2',
        title: 'React & UI coding',
        durationMinutes: 60,
        format: 'Build a React feature and discuss state management, testing and performance.',
        interviewerStyle: 'Asks how you would test the component and how it behaves with slow or failing APIs.',
        topics: [
          ...pick(machineCodingCore, 5, 3),
          ...pick(reactCore, 4, 1),
        ],
      },
      {
        type: 'SYSTEM_DESIGN',
        title: 'Design round',
        durationMinutes: 60,
        format: 'Design the frontend of a productivity or collaboration product.',
        interviewerStyle: 'Focuses on extensibility, component APIs shared across teams and reliability.',
        topics: [
          'Design a Teams-style chat frontend',
          'Design a calendar with recurring events',
          'Design a shared component library used by many teams',
          ...pick(systemDesignCore, 6, 2),
        ],
        behavioralTopic: 'Growth mindset: a time you learned from a failure',
      },
    ],
  },
  {
    id: 'apple',
    name: 'Apple',
    category: 'BIG_TECH',
    tagline: 'Web platform craft, performance and pixel-level polish.',
    bar: 'Team-specific loops that go deep on the web platform, attention to detail, accessibility and performance. Expect questions about past projects in detail.',
    rounds: [
      {
        type: 'ROUND_1',
        title: 'Web platform deep dive',
        durationMinutes: 60,
        format: 'Detailed JavaScript, browser and CSS questions, often grounded in your past work.',
        interviewerStyle: 'Asks "how does that actually work" repeatedly until you reach the platform level.',
        topics: [
          ...pick(jsCore, 5, 3),
          ...cssCore,
          'Web accessibility: semantics, ARIA and focus management',
          'Image and font loading strategies for crisp, fast pages',
        ],
      },
      {
        type: 'ROUND_2',
        title: 'UI coding & polish',
        durationMinutes: 60,
        format: 'Build an interactive component with smooth animation and full accessibility.',
        interviewerStyle: 'Notices janky animations, layout shifts and missing focus states.',
        topics: [
          'Animated image carousel without layout shift',
          'Build a responsive navigation menu with keyboard support',
          'Implement a smooth expand/collapse animation and explain the performance cost',
          ...pick(machineCodingCore, 4, 4),
        ],
      },
      {
        type: 'SYSTEM_DESIGN',
        title: 'Frontend design',
        durationMinutes: 60,
        format: 'Design a high-traffic, high-polish web experience.',
        interviewerStyle: 'Balances visual quality against performance on low-end devices.',
        topics: [
          'Design a product launch page that handles a traffic spike',
          'Design an online store checkout flow',
          ...pick(systemDesignCore, 6, 3),
        ],
      },
    ],
  },
  {
    id: 'atlassian',
    name: 'Atlassian',
    category: 'SAAS_ENTERPRISE',
    tagline: 'Practical frontend coding, code design and a values interview.',
    bar: 'Rounds commonly reported: frontend coding, code design, frontend system design, a values interview and a management interview. Values like "Don\'t #@!% the customer" and "Play, as a team" matter.',
    rounds: [
      {
        type: 'ROUND_1',
        title: 'Code design',
        durationMinutes: 60,
        format: 'Design and code a small extensible module (e.g. a rate limiter or a snake game engine) and evolve it with new requirements.',
        interviewerStyle: 'Adds requirements in stages; cares about clean abstractions and testability.',
        topics: [
          'Design an in-memory rate limiter and extend it per user',
          'Model a simple game engine (e.g. snake) with clean classes',
          'Design a plugin system for a text editor',
          'Implement an undo/redo stack',
          ...pick(jsCore, 4, 4),
        ],
      },
      {
        type: 'ROUND_2',
        title: 'Frontend coding',
        durationMinutes: 60,
        format: 'Build a React feature similar to a Jira or Confluence widget.',
        interviewerStyle: 'Expects incremental, working progress and good component boundaries.',
        topics: [
          'Kanban board with draggable cards between columns',
          'Inline-editable issue title with optimistic save',
          'Mention (@user) autocomplete in a text area',
          ...pick(machineCodingCore, 4, 1),
          ...pick(reactCore, 2, 2),
        ],
      },
      {
        type: 'SYSTEM_DESIGN',
        title: 'Frontend system design',
        durationMinutes: 60,
        format: 'Design a collaborative SaaS feature at Atlassian scale.',
        interviewerStyle: 'Probes extensibility for third-party apps, performance with large boards and permission handling.',
        topics: [
          'Design a Jira-style board with thousands of issues',
          'Design a Confluence-style collaborative page editor',
          'Design an embeddable third-party app framework',
          ...pick(systemDesignCore, 6, 4),
        ],
        behavioralTopic: 'Values: a time you put the customer first or played as a team',
      },
    ],
  },
  {
    id: 'adobe',
    name: 'Adobe',
    category: 'SAAS_ENTERPRISE',
    tagline: 'CS fundamentals, JavaScript depth and rich-UI performance.',
    bar: 'Mix of DSA, JavaScript/OOP fundamentals and frontend depth. Teams working on creative tools care about rendering performance and complex UI state.',
    rounds: [
      {
        type: 'ROUND_1',
        title: 'DSA & JavaScript fundamentals',
        durationMinutes: 60,
        format: 'A coding problem plus JavaScript, OOP and browser fundamentals.',
        interviewerStyle: 'Mixes output-prediction snippets with conceptual questions.',
        topics: [
          'Matrix or 2D grid problem in JavaScript',
          'Output prediction: closures, hoisting and the event loop',
          'OOP in JavaScript: classes, inheritance and composition',
          ...pick(jsCore, 5, 5),
          'Memory leaks in single-page apps and how to find them',
        ],
      },
      {
        type: 'ROUND_2',
        title: 'UI coding',
        durationMinutes: 60,
        format: 'Build a rich interactive component and discuss rendering performance.',
        interviewerStyle: 'Asks how your component behaves with very large inputs.',
        topics: [
          'Colour picker or slider component with keyboard support',
          'Canvas-based drawing board with undo',
          'Drag-to-resize panels layout',
          ...pick(machineCodingCore, 4, 5),
        ],
      },
      {
        type: 'SYSTEM_DESIGN',
        title: 'Frontend design',
        durationMinutes: 60,
        format: 'Design a web version of a creative or document tool.',
        interviewerStyle: 'Focuses on large-file handling, rendering pipelines and collaboration.',
        topics: [
          'Design a web-based image editor',
          'Design a PDF viewer with annotations',
          ...pick(systemDesignCore, 6, 5),
        ],
      },
    ],
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    category: 'SAAS_ENTERPRISE',
    tagline: 'JavaScript, web components and enterprise-scale UI.',
    bar: 'Commonly reported loops cover DSA, JavaScript depth, web components / component-model questions and design. Trust, accessibility and enterprise customisation are recurring themes.',
    rounds: [
      {
        type: 'ROUND_1',
        title: 'JavaScript & DSA',
        durationMinutes: 60,
        format: 'A coding problem and JavaScript fundamentals.',
        interviewerStyle: 'Methodical; asks for complexity and test cases.',
        topics: [
          'Sliding window problem in JavaScript',
          'Implement deep equality check',
          ...pick(jsCore, 6, 6),
          'Web components: custom elements and shadow DOM basics',
        ],
      },
      {
        type: 'ROUND_2',
        title: 'Component coding',
        durationMinutes: 60,
        format: 'Build a reusable, configurable component as you would for a platform used by many customers.',
        interviewerStyle: 'Asks how admins could configure it and how you keep it accessible.',
        topics: [
          'Configurable data table with column chooser',
          'Multi-step form wizard with validation',
          'Reusable lookup / combobox component',
          ...pick(machineCodingCore, 4, 6),
        ],
      },
      {
        type: 'SYSTEM_DESIGN',
        title: 'Design',
        durationMinutes: 60,
        format: 'Design a customisable enterprise UI.',
        interviewerStyle: 'Probes multi-tenancy, permissions and performance with large records.',
        topics: [
          'Design a CRM record page with configurable layouts',
          'Design a dashboard builder with drag-and-drop widgets',
          ...pick(systemDesignCore, 6, 6),
        ],
        behavioralTopic: 'Trust: a time you protected customer data or quality under pressure',
      },
    ],
  },
  {
    id: 'uber',
    name: 'Uber',
    category: 'BIG_TECH',
    tagline: 'Real-time UIs, DSA and strong frontend architecture.',
    bar: 'Rounds commonly include DSA, a frontend coding round and frontend system design; real-time and map-heavy experiences come up often.',
    rounds: [
      {
        type: 'ROUND_1',
        title: 'Coding',
        durationMinutes: 60,
        format: 'An algorithmic problem in JavaScript with follow-ups on optimisation.',
        interviewerStyle: 'Moves quickly; expects an optimal approach by the end.',
        topics: [
          'Heap / priority queue problem in JavaScript',
          'Grid shortest path (BFS)',
          'Implement a task scheduler with concurrency limit',
          ...pick(jsCore, 5, 7),
        ],
      },
      {
        type: 'ROUND_2',
        title: 'Frontend coding',
        durationMinutes: 60,
        format: 'Build an interactive UI that updates frequently.',
        interviewerStyle: 'Asks how your UI copes with rapid updates and flaky networks.',
        topics: [
          'Live trip status card that updates every few seconds',
          'Price estimate widget with debounced API calls and cancellation',
          ...pick(machineCodingCore, 5, 7),
        ],
      },
      {
        type: 'SYSTEM_DESIGN',
        title: 'Frontend system design',
        durationMinutes: 60,
        format: 'Design a real-time, map-heavy product.',
        interviewerStyle: 'Pushes on real-time transport, battery/network cost and failure modes.',
        topics: [
          'Design a ride-tracking page with a live map',
          'Design a food-delivery order tracker',
          ...pick(systemDesignCore, 6, 7),
        ],
      },
    ],
  },
  {
    id: 'expedia',
    name: 'Expedia',
    category: 'BIG_TECH',
    tagline: 'Search-heavy travel UIs, React depth and design.',
    bar: 'Loops commonly include DSA, JavaScript/React coding and system design, with travel search and booking flows as recurring contexts.',
    rounds: [
      {
        type: 'ROUND_1',
        title: 'DSA & JavaScript',
        durationMinutes: 60,
        format: 'A coding problem and JavaScript fundamentals.',
        interviewerStyle: 'Collaborative; values clear communication over speed.',
        topics: [
          'Sorting and filtering a list of hotels by multiple criteria',
          'Date range overlap problem',
          ...pick(jsCore, 6, 1),
        ],
      },
      {
        type: 'ROUND_2',
        title: 'React coding',
        durationMinutes: 60,
        format: 'Build a search-and-results UI in React.',
        interviewerStyle: 'Asks about URL state, filters and loading states.',
        topics: [
          'Date range picker with disabled dates',
          'Search results with filters synced to the URL',
          'Price slider with debounced filtering',
          ...pick(machineCodingCore, 4, 2),
          ...pick(reactCore, 2, 3),
        ],
      },
      {
        type: 'SYSTEM_DESIGN',
        title: 'System design',
        durationMinutes: 60,
        format: 'Design a travel search and booking experience.',
        interviewerStyle: 'Focuses on SEO, caching search results and multi-locale support.',
        topics: [
          'Design a hotel search results page',
          'Design a multi-step booking and payment flow',
          ...pick(systemDesignCore, 6, 2),
        ],
      },
    ],
  },
  {
    id: 'walmart',
    name: 'Walmart Global Tech',
    category: 'BIG_TECH',
    tagline: 'E-commerce scale React, DSA and machine coding.',
    bar: 'Commonly reported: DSA, JavaScript/React deep dive, machine coding and a design round for experienced hires.',
    rounds: [
      {
        type: 'ROUND_1',
        title: 'JavaScript & DSA',
        durationMinutes: 60,
        format: 'JavaScript fundamentals, polyfills and a DSA problem.',
        interviewerStyle: 'Likes polyfill questions and output-based snippets.',
        topics: [
          'Polyfill for Array.prototype.reduce or map',
          'Implement a memoize function',
          'Array problem with two pointers',
          ...pick(jsCore, 5, 2),
        ],
      },
      {
        type: 'ROUND_2',
        title: 'Machine coding',
        durationMinutes: 75,
        format: 'Build a small e-commerce feature in React within the time box.',
        interviewerStyle: 'Checks folder structure, reusable components and state handling.',
        topics: [
          'Product listing with cart and quantity updates',
          'Product filters with facet counts',
          ...pick(machineCodingCore, 5, 3),
        ],
      },
      {
        type: 'SYSTEM_DESIGN',
        title: 'Frontend design',
        durationMinutes: 60,
        format: 'Design a large retail web surface.',
        interviewerStyle: 'Focuses on SSR, SEO and peak-traffic events.',
        topics: [
          'Design a homepage for a big sale event',
          'Design a micro-frontend architecture for many teams',
          ...pick(systemDesignCore, 6, 3),
        ],
      },
    ],
  },
  {
    id: 'flipkart',
    name: 'Flipkart',
    category: 'INDIAN_PRODUCT',
    tagline: 'Famous machine coding round, PS/DS and UI depth.',
    bar: 'UI Engineer loops commonly start with a timed machine coding round, then problem solving / data structures, a UI tech deep dive and a hiring manager round. Working, modular code within the time box is essential.',
    rounds: [
      {
        type: 'ROUND_1',
        title: 'UI tech deep dive',
        durationMinutes: 60,
        format: 'JavaScript, browser and CSS internals, plus a short problem-solving question.',
        interviewerStyle: 'Asks layered "why" questions and output-based snippets.',
        topics: [
          ...pick(jsCore, 6),
          ...cssCore,
          'Implement a polyfill for Promise.allSettled',
          'Problem solving: group anagrams or top-k frequent items in JavaScript',
        ],
      },
      {
        type: 'ROUND_2',
        title: 'Machine coding',
        durationMinutes: 90,
        format: 'Build a complete mini-app from a spec in about 90 minutes, then walk the interviewer through it.',
        interviewerStyle: 'Evaluates working functionality first, then modularity, extensibility and edge cases.',
        topics: [
          'E-commerce product listing with filters, sort and cart',
          'Snake and ladder or tic-tac-toe game with configurable board',
          'Multi-level nested comments with reply and delete',
          ...pick(machineCodingCore, 5, 1),
        ],
      },
      {
        type: 'SYSTEM_DESIGN',
        title: 'UI architecture',
        durationMinutes: 60,
        format: 'Design a high-traffic e-commerce surface end to end.',
        interviewerStyle: 'Pushes on Big Billion Days-style traffic spikes and low-end devices.',
        topics: [
          'Design a product listing page for a sale event',
          'Design a lightweight PWA for low-end devices',
          ...pick(systemDesignCore, 6, 4),
        ],
      },
    ],
  },
  {
    id: 'phonepe',
    name: 'PhonePe',
    category: 'FINTECH',
    tagline: 'Rigorous machine coding and JavaScript fundamentals.',
    bar: 'Commonly reported: a demanding machine coding round, JavaScript/React deep dive, frontend design and a hiring manager discussion. Correctness and clean state handling matter in payments flows.',
    rounds: [
      {
        type: 'ROUND_1',
        title: 'JavaScript & React deep dive',
        durationMinutes: 60,
        format: 'Detailed JavaScript and React internals with output-based questions.',
        interviewerStyle: 'Expects precise answers about the event loop, rendering and memory.',
        topics: [
          ...pick(jsCore, 5, 3),
          ...pick(reactCore, 4),
          'Implement a retry-with-backoff wrapper around fetch',
        ],
      },
      {
        type: 'ROUND_2',
        title: 'Machine coding',
        durationMinutes: 90,
        format: 'Build a feature-complete component or mini-app with a strict time limit.',
        interviewerStyle: 'Looks for production-quality structure, edge cases and extensibility.',
        topics: [
          'UPI PIN / OTP input with paste, backspace and validation',
          'Transaction history list with filters and infinite scroll',
          'Split-bill calculator with validation',
          ...pick(machineCodingCore, 5, 2),
        ],
      },
      {
        type: 'SYSTEM_DESIGN',
        title: 'Frontend design',
        durationMinutes: 60,
        format: 'Design a payments or wallet experience.',
        interviewerStyle: 'Focuses on reliability, idempotency from the client side and security.',
        topics: [
          'Design a payment checkout that survives network drops',
          'Design a micro-app platform inside a super-app',
          ...pick(systemDesignCore, 6, 5),
        ],
      },
    ],
  },
  {
    id: 'paytm',
    name: 'Paytm',
    category: 'FINTECH',
    tagline: 'JavaScript polyfills, output questions and React.',
    bar: 'Frontend loops commonly focus on JavaScript fundamentals, polyfills, React and a machine coding or design discussion.',
    rounds: [
      {
        type: 'ROUND_1',
        title: 'JavaScript fundamentals',
        durationMinutes: 60,
        format: 'Rapid-fire JavaScript concepts, output prediction and polyfills.',
        interviewerStyle: 'Many short questions; expects confident, precise answers.',
        topics: [
          'Polyfill for Function.prototype.call / apply / bind',
          'Output prediction: setTimeout inside loops with var vs let',
          'Currying: implement sum(1)(2)(3)()',
          ...pick(jsCore, 6, 4),
        ],
      },
      {
        type: 'ROUND_2',
        title: 'React & machine coding',
        durationMinutes: 60,
        format: 'Build a React component and discuss state and performance.',
        interviewerStyle: 'Asks you to optimise re-renders once it works.',
        topics: [
          'Recharge plan selector with tabs and filters',
          'Countdown timer component with pause and resume',
          ...pick(machineCodingCore, 4, 3),
          ...pick(reactCore, 2, 4),
        ],
      },
      {
        type: 'SYSTEM_DESIGN',
        title: 'Design discussion',
        durationMinutes: 60,
        format: 'Design a fintech consumer surface.',
        interviewerStyle: 'Focuses on security, performance on mobile web and error handling.',
        topics: [
          'Design a wallet home screen on mobile web',
          'Design a bill payments flow with saved billers',
          ...pick(systemDesignCore, 6, 6),
        ],
      },
    ],
  },
  {
    id: 'razorpay',
    name: 'Razorpay',
    category: 'FINTECH',
    tagline: 'Machine coding, JavaScript depth and culture fit.',
    bar: 'Commonly reported: machine coding, JavaScript/frontend deep dive, system design and a culture round. Developer-experience and reliability are valued.',
    rounds: [
      {
        type: 'ROUND_1',
        title: 'Frontend deep dive',
        durationMinutes: 60,
        format: 'JavaScript, browser security and performance questions.',
        interviewerStyle: 'Connects concepts to real payment-gateway scenarios.',
        topics: [
          ...pick(jsCore, 5, 6),
          'XSS, CSRF and CSP in a checkout page',
          'Cross-origin iframes and postMessage security',
          'Loading third-party scripts safely and fast',
        ],
      },
      {
        type: 'ROUND_2',
        title: 'Machine coding',
        durationMinutes: 90,
        format: 'Build a polished component or small app within the time limit.',
        interviewerStyle: 'Values clean, readable code and sensible component APIs.',
        topics: [
          'Embeddable checkout form with card number formatting and validation',
          'Payment links dashboard table with filters',
          ...pick(machineCodingCore, 5, 4),
        ],
      },
      {
        type: 'SYSTEM_DESIGN',
        title: 'System design',
        durationMinutes: 60,
        format: 'Design a developer-facing or merchant-facing product.',
        interviewerStyle: 'Pushes on embeddability, versioning and reliability.',
        topics: [
          'Design an embeddable checkout widget used on thousands of sites',
          'Design a merchant analytics dashboard',
          ...pick(systemDesignCore, 6, 7),
        ],
      },
    ],
  },
  {
    id: 'cred',
    name: 'CRED',
    category: 'FINTECH',
    tagline: 'High-craft UI, animation and machine coding.',
    bar: 'Known for a high design bar: smooth animations, attention to detail and well-structured code. Loops commonly include machine coding, frontend depth and design.',
    rounds: [
      {
        type: 'ROUND_1',
        title: 'Frontend fundamentals',
        durationMinutes: 60,
        format: 'JavaScript, CSS and rendering performance questions.',
        interviewerStyle: 'Asks about how animations run in the browser and how to keep 60fps.',
        topics: [
          ...pick(jsCore, 4, 2),
          ...cssCore,
          'Compositor-only animations: transform and opacity vs layout properties',
          'requestAnimationFrame vs CSS transitions',
          'Measuring and fixing layout thrashing',
        ],
      },
      {
        type: 'ROUND_2',
        title: 'Machine coding (UI craft)',
        durationMinutes: 90,
        format: 'Build an interactive, animated UI component with clean structure.',
        interviewerStyle: 'Notices polish: transitions, empty states and micro-interactions.',
        topics: [
          'Swipeable card stack with smooth gestures',
          'Animated bottom sheet with drag-to-dismiss',
          'Reward scratch card interaction',
          ...pick(machineCodingCore, 4, 6),
        ],
      },
      {
        type: 'SYSTEM_DESIGN',
        title: 'Frontend design',
        durationMinutes: 60,
        format: 'Design a delightful, high-performance consumer experience.',
        interviewerStyle: 'Balances rich visuals with performance on mid-range phones.',
        topics: [
          'Design a rewards and offers feed',
          'Design a server-driven UI system',
          ...pick(systemDesignCore, 6),
        ],
      },
    ],
  },
  {
    id: 'swiggy',
    name: 'Swiggy',
    category: 'INDIAN_PRODUCT',
    tagline: 'Machine coding, React and real-time order tracking.',
    bar: 'Commonly reported: machine coding, JavaScript/React deep dive, system design for experienced roles and a hiring manager round.',
    rounds: [
      {
        type: 'ROUND_1',
        title: 'JavaScript & React',
        durationMinutes: 60,
        format: 'Core JavaScript and React concepts with small coding tasks.',
        interviewerStyle: 'Mixes theory with "write it now" snippets.',
        topics: [
          ...pick(jsCore, 5, 1),
          ...pick(reactCore, 4, 2),
        ],
      },
      {
        type: 'ROUND_2',
        title: 'Machine coding',
        durationMinutes: 90,
        format: 'Build a food-ordering style feature in React.',
        interviewerStyle: 'Checks working code first, then structure and edge cases.',
        topics: [
          'Restaurant menu with categories, search and add-to-cart',
          'Cart with item customisations and price calculation',
          ...pick(machineCodingCore, 5, 5),
        ],
      },
      {
        type: 'SYSTEM_DESIGN',
        title: 'Frontend system design',
        durationMinutes: 60,
        format: 'Design a high-traffic consumer flow.',
        interviewerStyle: 'Focuses on real-time updates and peak dinner-time load.',
        topics: [
          'Design a live order tracking page',
          'Design a restaurant listing page with personalisation',
          ...pick(systemDesignCore, 6, 1),
        ],
      },
    ],
  },
  {
    id: 'zomato',
    name: 'Zomato',
    category: 'INDIAN_PRODUCT',
    tagline: 'React depth, machine coding and fast consumer UIs.',
    bar: 'Commonly reported: JavaScript/React fundamentals, machine coding and a design or hiring manager round.',
    rounds: [
      {
        type: 'ROUND_1',
        title: 'Frontend fundamentals',
        durationMinutes: 60,
        format: 'JavaScript, React and browser fundamentals.',
        interviewerStyle: 'Practical; ties questions to consumer-app scenarios.',
        topics: [
          ...pick(jsCore, 4, 5),
          ...pick(reactCore, 3, 3),
          ...pick(cssCore, 2),
        ],
      },
      {
        type: 'ROUND_2',
        title: 'Machine coding',
        durationMinutes: 75,
        format: 'Build a consumer feature in React within the time box.',
        interviewerStyle: 'Expects a working build and clear explanation of trade-offs.',
        topics: [
          'Restaurant reviews list with ratings filter',
          'Dish image gallery with lazy loading',
          ...pick(machineCodingCore, 5, 6),
        ],
      },
      {
        type: 'SYSTEM_DESIGN',
        title: 'Design round',
        durationMinutes: 60,
        format: 'Design a discovery or ordering surface.',
        interviewerStyle: 'Focuses on SEO for listing pages and image performance.',
        topics: [
          'Design a restaurant discovery page with SEO',
          'Design a quick-commerce product grid',
          ...pick(systemDesignCore, 6, 2),
        ],
      },
    ],
  },
  {
    id: 'meesho',
    name: 'Meesho',
    category: 'STARTUP',
    tagline: 'Performance on low-end devices and machine coding.',
    bar: 'Commonly reported: machine coding, JavaScript depth and design, with a strong focus on performance for users on low-end phones and slow networks.',
    rounds: [
      {
        type: 'ROUND_1',
        title: 'JavaScript & performance',
        durationMinutes: 60,
        format: 'JavaScript fundamentals and web performance.',
        interviewerStyle: 'Asks how you would measure before optimising.',
        topics: [
          ...pick(jsCore, 5, 4),
          'Core Web Vitals: LCP, INP and CLS and how to improve them',
          'Reducing JavaScript bundle size',
          'Image optimisation for slow networks',
        ],
      },
      {
        type: 'ROUND_2',
        title: 'Machine coding',
        durationMinutes: 90,
        format: 'Build an e-commerce style feature in React.',
        interviewerStyle: 'Checks modular code and performance with long lists.',
        topics: [
          'Product feed with infinite scroll and image lazy loading',
          'Share-to-WhatsApp product card with deep link',
          ...pick(machineCodingCore, 5, 7),
        ],
      },
      {
        type: 'SYSTEM_DESIGN',
        title: 'Frontend design',
        durationMinutes: 60,
        format: 'Design a performant consumer surface for low-end devices.',
        interviewerStyle: 'Pushes on data usage, caching and offline resilience.',
        topics: [
          'Design a product feed for low-end Android phones',
          'Design a seller onboarding flow',
          ...pick(systemDesignCore, 6, 3),
        ],
      },
    ],
  },
  {
    id: 'zepto',
    name: 'Zepto',
    category: 'STARTUP',
    tagline: 'Fast-moving quick-commerce UIs and machine coding.',
    bar: 'Startup-style loops: machine coding, JavaScript/React depth and a design discussion with emphasis on speed of execution and ownership.',
    rounds: [
      {
        type: 'ROUND_1',
        title: 'JavaScript & React',
        durationMinutes: 60,
        format: 'Core JavaScript and React with practical snippets.',
        interviewerStyle: 'Fast-paced; values pragmatic answers.',
        topics: [
          ...pick(jsCore, 5, 7),
          ...pick(reactCore, 4, 4),
        ],
      },
      {
        type: 'ROUND_2',
        title: 'Machine coding',
        durationMinutes: 75,
        format: 'Build a quick-commerce feature in React.',
        interviewerStyle: 'Wants a working build quickly, then improvements.',
        topics: [
          'Category grid with add-to-cart steppers',
          'Delivery slot picker with availability',
          ...pick(machineCodingCore, 5),
        ],
      },
      {
        type: 'SYSTEM_DESIGN',
        title: 'Design discussion',
        durationMinutes: 60,
        format: 'Design a quick-commerce consumer flow.',
        interviewerStyle: 'Focuses on inventory freshness and checkout speed.',
        topics: [
          'Design a 10-minute delivery home screen with live inventory',
          'Design a cart that reconciles out-of-stock items',
          ...pick(systemDesignCore, 6, 4),
        ],
      },
    ],
  },
  {
    id: 'airtel',
    name: 'Airtel',
    category: 'INDIAN_PRODUCT',
    tagline: 'JavaScript, React / React Native and app-scale UIs.',
    bar: 'Commonly reported: JavaScript and React (often React Native for app teams), problem solving and a design or managerial round. Scale of millions of users and payments flows are common contexts.',
    rounds: [
      {
        type: 'ROUND_1',
        title: 'JavaScript & React fundamentals',
        durationMinutes: 60,
        format: 'JavaScript, React and basic problem solving.',
        interviewerStyle: 'Practical; ties questions to app features.',
        topics: [
          ...pick(jsCore, 5, 5),
          ...pick(reactCore, 3, 1),
          'React Native vs web: rendering and the bridge / new architecture at a high level',
        ],
      },
      {
        type: 'ROUND_2',
        title: 'Coding round',
        durationMinutes: 60,
        format: 'Build a feature component in React and discuss state and APIs.',
        interviewerStyle: 'Asks about error handling and offline states.',
        topics: [
          'Recharge / bill payment form with plan selection',
          'Bank selection list with health callouts for unavailable banks',
          ...pick(machineCodingCore, 5, 2),
        ],
      },
      {
        type: 'SYSTEM_DESIGN',
        title: 'Design round',
        durationMinutes: 60,
        format: 'Design an app-scale consumer flow.',
        interviewerStyle: 'Focuses on reliability, OTA updates and observability.',
        topics: [
          'Design a payments checkout used by millions of users',
          'Design a configurable home screen driven by the server',
          ...pick(systemDesignCore, 6, 5),
        ],
      },
    ],
  },
]

// ---------------------------------------------------------------------------------------------------------------
// Expanded catalog: companies built from an interview archetype (how the loop is commonly reported to run) plus
// company-specific build tasks and design prompts, so each company still feels like its own product.
// ---------------------------------------------------------------------------------------------------------------

type Archetype = 'AI_PRODUCT' | 'DSA_HEAVY' | 'MACHINE_CODING' | 'STARTUP' | 'ENTERPRISE' | 'BANKING'

type CompanySpec = {
  id: string
  name: string
  category: CompanyCategory
  archetype: Archetype
  tagline: string
  /** Two company-flavoured UI build tasks for the coding round. */
  build: [string, string]
  /** Two company-flavoured frontend design prompts. */
  design: [string, string]
  behavioral?: string
}

type ArchetypeRound = Omit<CompanyRoundBlueprint, 'type' | 'topics' | 'behavioralTopic'> & { baseTopics: (offset: number) => string[] }

const aiProductCore = [
  'Stream a response with fetch and ReadableStream, rendering tokens as they arrive',
  'Server-sent events vs WebSockets for streaming model output',
  'Cancel an in-flight streaming request with AbortController',
  'Render streaming markdown and code blocks safely (no XSS)',
  'Async iterators and generators for chunked data',
  'Retry with exponential backoff and handling rate-limit (429) responses',
]

const archetypes: Record<Archetype, { bar: (name: string) => string; rounds: Record<CompanyRoundType, ArchetypeRound> }> = {
  AI_PRODUCT: {
    bar: (name) =>
      `${name}'s frontend interviews are commonly reported to favour practical, real-world coding over puzzle-style questions: building product features end to end, strong JavaScript and React fundamentals, and product sense for AI experiences (streaming, latency, failure states). The bar is high and senior-leaning.`,
    rounds: {
      ROUND_1: {
        title: 'Practical JavaScript coding',
        durationMinutes: 60,
        format: 'A realistic coding task in JavaScript or TypeScript (no trick puzzles), then fundamentals and async follow-ups.',
        interviewerStyle: 'Pair-programming feel; cares about clean, working code, async correctness and how you test it.',
        baseTopics: (offset) => [...pick(aiProductCore, 4, offset), ...pick(jsCore, 4, offset)],
      },
      ROUND_2: {
        title: 'Build an AI product feature',
        durationMinutes: 90,
        format: 'Build a feature of an AI product in React from a short spec, extending it as requirements are added.',
        interviewerStyle: 'Looks at product polish: loading and streaming states, errors, accessibility and responsiveness.',
        baseTopics: (offset) => [
          'Chat UI that streams an assistant reply with stop and regenerate',
          'Conversation sidebar with rename, delete and search',
          'Prompt input with file attachments and keyboard shortcuts',
          ...pick(machineCodingCore, 3, offset),
        ],
      },
      SYSTEM_DESIGN: {
        title: 'Frontend system design for AI products',
        durationMinutes: 60,
        format: 'Design the frontend of an AI product used by millions, end to end.',
        interviewerStyle: 'Probes streaming architecture, perceived latency, state for long conversations and graceful failure.',
        baseTopics: (offset) => [
          'Design a ChatGPT-style chat app with streaming and conversation history',
          'Design a collaborative AI document editor with inline suggestions',
          'Design an AI code-assistant panel inside a web IDE',
          ...pick(systemDesignCore, 5, offset),
        ],
      },
    },
  },
  DSA_HEAVY: {
    bar: (name) =>
      `${name}'s frontend loop is commonly reported to be algorithm-heavy: data-structure problems solved in JavaScript, a frontend coding round and, for experienced hires, frontend system design. Clear reasoning about complexity matters.`,
    rounds: {
      ROUND_1: {
        title: 'DSA in JavaScript',
        durationMinutes: 60,
        format: 'One or two data-structure problems solved in JavaScript, then JavaScript fundamentals.',
        interviewerStyle: 'Expects you to clarify, discuss brute force, optimise and state complexity before coding.',
        baseTopics: (offset) => [
          'Array / string problem with optimal time and space complexity',
          'Hash map or set based counting problem',
          'Tree or graph traversal in JavaScript',
          'Sliding window or two-pointer problem',
          ...pick(jsCore, 4, offset),
        ],
      },
      ROUND_2: {
        title: 'Frontend coding',
        durationMinutes: 60,
        format: 'Build a UI component in React or vanilla JavaScript and discuss edge cases.',
        interviewerStyle: 'Wants working code first, then accessibility, performance and tests.',
        baseTopics: (offset) => pick(machineCodingCore, 5, offset),
      },
      SYSTEM_DESIGN: {
        title: 'Frontend system design',
        durationMinutes: 60,
        format: 'Design a large-scale frontend product surface end to end.',
        interviewerStyle: 'Pushes on scale, performance budgets and failure handling.',
        baseTopics: (offset) => pick(systemDesignCore, 6, offset),
      },
    },
  },
  MACHINE_CODING: {
    bar: (name) =>
      `${name}'s frontend loop is commonly reported to centre on a timed machine coding round, with a JavaScript/React deep dive and a design round for experienced roles. Working, modular code within the time box is key.`,
    rounds: {
      ROUND_1: {
        title: 'JavaScript & React deep dive',
        durationMinutes: 60,
        format: 'JavaScript internals, React behaviour and output-based snippets.',
        interviewerStyle: 'Asks layered "why" questions until you reach the underlying mechanism.',
        baseTopics: (offset) => [...pick(jsCore, 5, offset), ...pick(reactCore, 3, offset), 'Implement a polyfill for a common Array or Promise method'],
      },
      ROUND_2: {
        title: 'Machine coding',
        durationMinutes: 90,
        format: 'Build a feature-complete mini-app from a spec within the time limit, then walk through it.',
        interviewerStyle: 'Checks working functionality, then modularity, extensibility and edge cases.',
        baseTopics: (offset) => pick(machineCodingCore, 5, offset),
      },
      SYSTEM_DESIGN: {
        title: 'Frontend system design',
        durationMinutes: 60,
        format: 'Design a high-traffic consumer frontend.',
        interviewerStyle: 'Focuses on rendering strategy, caching and peak-traffic behaviour.',
        baseTopics: (offset) => pick(systemDesignCore, 6, offset),
      },
    },
  },
  STARTUP: {
    bar: (name) =>
      `${name} is commonly reported to run a startup-style loop: practical JavaScript/React, a machine coding round and a design or hiring-manager discussion. Ownership and speed of execution are valued.`,
    rounds: {
      ROUND_1: {
        title: 'JavaScript & React',
        durationMinutes: 60,
        format: 'Core JavaScript and React with practical, write-it-now snippets.',
        interviewerStyle: 'Fast-paced and pragmatic; ties questions to real product problems.',
        baseTopics: (offset) => [...pick(jsCore, 4, offset), ...pick(reactCore, 3, offset), ...pick(cssCore, 1, offset)],
      },
      ROUND_2: {
        title: 'Machine coding',
        durationMinutes: 75,
        format: 'Build a product feature in React within the time box.',
        interviewerStyle: 'Wants a working build quickly, then asks for improvements.',
        baseTopics: (offset) => pick(machineCodingCore, 5, offset),
      },
      SYSTEM_DESIGN: {
        title: 'Design discussion',
        durationMinutes: 60,
        format: 'Design a core product flow and discuss trade-offs.',
        interviewerStyle: 'Balances ideal architecture against shipping fast with a small team.',
        baseTopics: (offset) => pick(systemDesignCore, 6, offset),
      },
    },
  },
  ENTERPRISE: {
    bar: (name) =>
      `${name}'s loop is commonly reported to mix CS/JavaScript fundamentals, component-level coding and a design round. Reusable, accessible components and maintainability at enterprise scale are recurring themes.`,
    rounds: {
      ROUND_1: {
        title: 'JavaScript & CS fundamentals',
        durationMinutes: 60,
        format: 'A coding problem plus JavaScript, OOP and browser fundamentals.',
        interviewerStyle: 'Methodical; mixes conceptual questions with small coding tasks.',
        baseTopics: (offset) => [
          'Coding problem in JavaScript with test cases',
          'OOP in JavaScript: classes, composition and SOLID basics',
          ...pick(jsCore, 5, offset),
          'Web accessibility basics: semantics, labels and focus',
        ],
      },
      ROUND_2: {
        title: 'Component coding',
        durationMinutes: 60,
        format: 'Build a reusable, configurable component as you would for a product used by many teams or customers.',
        interviewerStyle: 'Asks about component API design, accessibility and testing.',
        baseTopics: (offset) => [...pick(machineCodingCore, 4, offset), ...pick(reactCore, 2, offset)],
      },
      SYSTEM_DESIGN: {
        title: 'Design round',
        durationMinutes: 60,
        format: 'Design an enterprise web application or platform feature.',
        interviewerStyle: 'Probes permissions, configurability, large data sets and maintainability.',
        baseTopics: (offset) => pick(systemDesignCore, 6, offset),
      },
    },
  },
  BANKING: {
    bar: (name) =>
      `${name}'s technology loop is commonly reported to include a coding assessment, JavaScript/React fundamentals and a design discussion. Security, correctness and reliability are emphasised for financial products.`,
    rounds: {
      ROUND_1: {
        title: 'Coding & JavaScript',
        durationMinutes: 60,
        format: 'A coding problem in JavaScript and JavaScript fundamentals.',
        interviewerStyle: 'Careful and correctness-focused; asks about edge cases and testing.',
        baseTopics: (offset) => [
          'Coding problem with numbers and precision (currency rounding)',
          'Data transformation problem on a list of transactions',
          ...pick(jsCore, 5, offset),
          'Frontend security: XSS, CSRF and secure storage of tokens',
        ],
      },
      ROUND_2: {
        title: 'React & UI coding',
        durationMinutes: 60,
        format: 'Build a data-heavy React component with validation and error states.',
        interviewerStyle: 'Looks for defensive code, accessibility and clear state handling.',
        baseTopics: (offset) => [...pick(machineCodingCore, 4, offset), ...pick(reactCore, 2, offset)],
      },
      SYSTEM_DESIGN: {
        title: 'Design & architecture',
        durationMinutes: 60,
        format: 'Design a secure, reliable financial web application.',
        interviewerStyle: 'Focuses on security, auditability, session handling and resilience.',
        baseTopics: (offset) => pick(systemDesignCore, 6, offset),
      },
    },
  },
}

const companySpecs: CompanySpec[] = [
  // AI companies
  { id: 'openai', name: 'OpenAI', category: 'AI', archetype: 'AI_PRODUCT', tagline: 'Practical coding and polished AI product UIs at huge scale.', build: ['Model picker with capability badges and keyboard navigation', 'Shared conversation view with copy and citations'], design: ['Design ChatGPT-style memory and settings across devices', 'Design an API playground with streaming output'] },
  { id: 'anthropic', name: 'Anthropic', category: 'AI', archetype: 'AI_PRODUCT', tagline: 'Thoughtful, practical engineering for Claude products.', build: ['Artifact preview panel next to a chat thread', 'Project knowledge uploader with file list and limits'], design: ['Design a chat product with side-by-side artifacts', 'Design a usage and rate-limit aware console'], behavioral: 'Values: a time you raised a safety or quality concern and how you handled it' },
  { id: 'google-deepmind', name: 'Google DeepMind', category: 'AI', archetype: 'DSA_HEAVY', tagline: 'Research-to-product tooling with Google-level rigour.', build: ['Experiment results table with metric charts', 'Prompt comparison view for two model outputs'], design: ['Design an internal model evaluation dashboard', 'Design a multimodal assistant web client'] },
  { id: 'nvidia', name: 'NVIDIA', category: 'AI', archetype: 'ENTERPRISE', tagline: 'Developer platforms, dashboards and high-performance UIs.', build: ['GPU utilisation dashboard with live charts', 'Model catalogue with filters and deploy button'], design: ['Design a cloud GPU console', 'Design a developer portal for AI models and SDKs'] },
  { id: 'perplexity', name: 'Perplexity', category: 'AI', archetype: 'AI_PRODUCT', tagline: 'Fast, design-led answer engine UIs.', build: ['Answer view with numbered inline citations and source cards', 'Follow-up question suggestions under an answer'], design: ['Design an answer engine with streaming answers and sources', 'Design a shareable "page" built from a conversation'] },
  { id: 'databricks', name: 'Databricks', category: 'AI', archetype: 'DSA_HEAVY', tagline: 'Data and AI platform UIs: notebooks, tables and dashboards.', build: ['Virtualised results table for a large query', 'Notebook cell with run, output and error states'], design: ['Design a collaborative data notebook', 'Design an AI/BI dashboard builder'] },
  { id: 'cursor', name: 'Cursor (Anysphere)', category: 'AI', archetype: 'AI_PRODUCT', tagline: 'AI-first code editor engineering with a very high bar.', build: ['Inline diff view to accept or reject an AI edit', 'Command palette with fuzzy search'], design: ['Design an AI agent panel that edits many files', 'Design low-latency inline code completions in an editor'] },
  { id: 'mistral', name: 'Mistral AI', category: 'AI', archetype: 'AI_PRODUCT', tagline: 'Lean teams shipping chat and developer platforms.', build: ['API key management page with create, copy and revoke', 'Chat with model and temperature controls'], design: ['Design a developer console with usage billing', 'Design a multilingual chat assistant'] },
  { id: 'elevenlabs', name: 'ElevenLabs', category: 'AI', archetype: 'AI_PRODUCT', tagline: 'Voice AI products with rich audio interfaces.', build: ['Audio player with waveform and scrubbing', 'Text-to-speech editor with voice picker and preview'], design: ['Design a dubbing studio for long videos', 'Design a real-time conversational voice agent UI'] },
  { id: 'scale-ai', name: 'Scale AI', category: 'AI', archetype: 'MACHINE_CODING', tagline: 'Data labelling tools and complex annotation UIs.', build: ['Image annotation tool with bounding boxes', 'Task review queue with keyboard shortcuts'], design: ['Design a large-scale data annotation platform', 'Design an LLM evaluation and ranking tool'] },
  // Big Tech & global product
  { id: 'meta', name: 'Meta', category: 'BIG_TECH', archetype: 'DSA_HEAVY', tagline: 'Fast-paced coding rounds and product-scale frontend design.', build: ['News feed post composer with mentions and preview', 'Reactions picker with hover and keyboard support'], design: ['Design a social news feed with infinite scroll', 'Design a real-time comments system for live videos'], behavioral: 'Behavioural: a time you moved fast and handled conflict on a team' },
  { id: 'netflix', name: 'Netflix', category: 'BIG_TECH', archetype: 'DSA_HEAVY', tagline: 'Senior-leaning loops focused on UI performance and ownership.', build: ['Horizontally scrolling title rows with lazy-loaded artwork', 'Video player controls with keyboard shortcuts'], design: ['Design a streaming home page personalised per profile', 'Design a TV-friendly UI with remote-control navigation'], behavioral: 'Culture: a time you exercised judgement with freedom and responsibility' },
  { id: 'linkedin', name: 'LinkedIn', category: 'BIG_TECH', archetype: 'DSA_HEAVY', tagline: 'Coding, frontend craft and large-scale feed design.', build: ['Connection suggestions carousel with dismiss', 'Rich-text post editor with hashtags'], design: ['Design a professional feed with ranking and ads', 'Design a messaging inbox with typing indicators'] },
  { id: 'airbnb', name: 'Airbnb', category: 'BIG_TECH', archetype: 'DSA_HEAVY', tagline: 'Product-minded coding and polished, accessible UI.', build: ['Listing search with map and list kept in sync', 'Date range picker with blocked nights'], design: ['Design a stays search results page with a map', 'Design a booking flow across devices'], behavioral: 'Core values: a time you went above and beyond for a user' },
  { id: 'booking', name: 'Booking.com', category: 'BIG_TECH', archetype: 'DSA_HEAVY', tagline: 'Experimentation-driven travel UIs and solid fundamentals.', build: ['Hotel filters sidebar with live result counts', 'Room selection with price breakdown'], design: ['Design an A/B-testable search results page', 'Design a multi-language property page'] },
  { id: 'agoda', name: 'Agoda', category: 'BIG_TECH', archetype: 'DSA_HEAVY', tagline: 'Travel search at scale with performance focus.', build: ['Hotel card list with lazy images and price badges', 'Guest and room selector popover'], design: ['Design a fast hotel search for slow networks', 'Design a deals page handling traffic spikes'] },
  { id: 'oracle', name: 'Oracle', category: 'SAAS_ENTERPRISE', archetype: 'ENTERPRISE', tagline: 'Enterprise apps, fundamentals and component design.', build: ['Editable grid with inline validation', 'Hierarchical tree select'], design: ['Design an enterprise reporting dashboard', 'Design a role-based admin console'] },
  { id: 'sap-labs', name: 'SAP Labs', category: 'SAAS_ENTERPRISE', archetype: 'ENTERPRISE', tagline: 'Business applications, UI5-style components and fundamentals.', build: ['Master-detail list with filters', 'Form with dependent dropdowns'], design: ['Design a procurement approval workflow UI', 'Design a configurable analytics dashboard'] },
  { id: 'cisco', name: 'Cisco', category: 'SAAS_ENTERPRISE', archetype: 'ENTERPRISE', tagline: 'Networking dashboards, fundamentals and reliability.', build: ['Device status table with live updates', 'Topology list with expandable groups'], design: ['Design a network monitoring dashboard', 'Design a video meeting web client'] },
  { id: 'intuit', name: 'Intuit', category: 'SAAS_ENTERPRISE', archetype: 'ENTERPRISE', tagline: 'Craft-focused coding and customer-first design.', build: ['Multi-step tax form with save and resume', 'Expense categoriser with bulk edit'], design: ['Design a small-business invoicing app', 'Design a guided form that adapts to answers'], behavioral: 'Values: a time you solved a real customer problem end to end' },
  { id: 'servicenow', name: 'ServiceNow', category: 'SAAS_ENTERPRISE', archetype: 'ENTERPRISE', tagline: 'Workflow platforms and configurable UI components.', build: ['Ticket list with saved filters', 'Form builder field palette'], design: ['Design a no-code workflow builder', 'Design an IT service portal'] },
  { id: 'workday', name: 'Workday', category: 'SAAS_ENTERPRISE', archetype: 'ENTERPRISE', tagline: 'HR and finance apps with strong accessibility.', build: ['Org chart viewer with search', 'Leave request form with calendar'], design: ['Design an employee self-service portal', 'Design a payroll review dashboard'] },
  { id: 'broadcom-vmware', name: 'Broadcom (VMware)', category: 'SAAS_ENTERPRISE', archetype: 'ENTERPRISE', tagline: 'Infrastructure consoles and data-heavy UIs.', build: ['Virtual machine list with bulk actions', 'Resource usage chart with time range picker'], design: ['Design a cloud infrastructure console', 'Design a multi-tenant admin dashboard'] },
  { id: 'nutanix', name: 'Nutanix', category: 'SAAS_ENTERPRISE', archetype: 'DSA_HEAVY', tagline: 'Hybrid-cloud consoles, DSA and frontend depth.', build: ['Cluster health cards with polling', 'Wizard for creating a resource'], design: ['Design a hybrid-cloud management console', 'Design an alerts and events timeline'] },
  { id: 'twilio', name: 'Twilio', category: 'SAAS_ENTERPRISE', archetype: 'ENTERPRISE', tagline: 'Developer-facing consoles and communication UIs.', build: ['API logs viewer with filters and pagination', 'Phone number search and purchase list'], design: ['Design a developer console with usage metrics', 'Design an embeddable chat widget'] },
  { id: 'sprinklr', name: 'Sprinklr', category: 'SAAS_ENTERPRISE', archetype: 'MACHINE_CODING', tagline: 'Complex dashboards and machine coding.', build: ['Social inbox with assignment and tags', 'Widget-based dashboard with resize'], design: ['Design a unified customer experience dashboard', 'Design a real-time social listening feed'] },
  { id: 'thoughtworks', name: 'Thoughtworks', category: 'SAAS_ENTERPRISE', archetype: 'ENTERPRISE', tagline: 'Pairing, clean code and test-driven development.', build: ['Shopping cart built test-first', 'Refactor a messy component into clean parts'], design: ['Design a micro-frontend architecture for a retailer', 'Design a CI-friendly frontend testing strategy'], behavioral: 'Collaboration: a time you paired or mentored to improve code quality' },
  { id: 'publicis-sapient', name: 'Publicis Sapient', category: 'SAAS_ENTERPRISE', archetype: 'ENTERPRISE', tagline: 'Client-facing digital products and React fundamentals.', build: ['Product listing page with filters', 'Responsive navigation with mega menu'], design: ['Design a headless-CMS powered marketing site', 'Design a retail checkout for multiple brands'] },
  // Banking & payments
  { id: 'paypal', name: 'PayPal', category: 'FINTECH', archetype: 'DSA_HEAVY', tagline: 'Payments UIs, DSA and secure frontend design.', build: ['Send-money form with contact search and validation', 'Transaction activity list with filters'], design: ['Design a checkout embedded in merchant sites', 'Design a payments dashboard for merchants'] },
  { id: 'visa', name: 'Visa', category: 'FINTECH', archetype: 'BANKING', tagline: 'Secure payments experiences and fundamentals.', build: ['Card details form with formatting and Luhn validation', 'Transaction dispute form'], design: ['Design a card management portal', 'Design a merchant onboarding flow'] },
  { id: 'mastercard', name: 'Mastercard', category: 'FINTECH', archetype: 'BANKING', tagline: 'Payment products with security and accessibility.', build: ['Spending insights chart with categories', 'Card controls toggles with confirmation'], design: ['Design a cardholder rewards portal', 'Design a fraud alert review dashboard'] },
  { id: 'amex', name: 'American Express', category: 'FINTECH', archetype: 'BANKING', tagline: 'Card servicing apps, fundamentals and design.', build: ['Statement viewer with filters and export', 'Payment scheduling form'], design: ['Design an online card account dashboard', 'Design an offers and rewards experience'] },
  { id: 'goldman-sachs', name: 'Goldman Sachs', category: 'FINTECH', archetype: 'BANKING', tagline: 'Coding assessments and data-dense financial UIs.', build: ['Live price ticker table with sorting', 'Order entry form with validation'], design: ['Design a trading dashboard with streaming prices', 'Design a client reporting portal'] },
  { id: 'jpmorgan', name: 'JPMorgan Chase', category: 'FINTECH', archetype: 'BANKING', tagline: 'Banking apps with React, security and reliability.', build: ['Account overview cards with balances', 'Payee management with verification'], design: ['Design an online banking dashboard', 'Design a secure document upload flow'] },
  { id: 'morgan-stanley', name: 'Morgan Stanley', category: 'FINTECH', archetype: 'BANKING', tagline: 'Fundamentals-heavy loops and data-rich interfaces.', build: ['Portfolio holdings table with grouping', 'Performance chart with range selector'], design: ['Design a wealth management client portal', 'Design an internal analytics workspace'] },
  { id: 'juspay', name: 'Juspay', category: 'FINTECH', archetype: 'MACHINE_CODING', tagline: 'Payment SDKs, functional thinking and machine coding.', build: ['Payment method selector with saved cards', 'UPI intent flow with status polling'], design: ['Design a cross-platform payment SDK UI', 'Design a payment orchestration dashboard'] },
  { id: 'groww', name: 'Groww', category: 'FINTECH', archetype: 'MACHINE_CODING', tagline: 'Investing UIs, real-time prices and machine coding.', build: ['Stock watchlist with live prices', 'SIP calculator with chart'], design: ['Design a stock detail page with live charts', 'Design a mutual fund discovery flow'] },
  { id: 'zerodha', name: 'Zerodha', category: 'FINTECH', archetype: 'STARTUP', tagline: 'Lean, performance-obsessed trading interfaces.', build: ['Market depth widget updating many times a second', 'Order window with keyboard shortcuts'], design: ['Design a trading terminal handling high-frequency ticks', 'Design a lightweight console for reports'] },
  { id: 'upstox', name: 'Upstox', category: 'FINTECH', archetype: 'MACHINE_CODING', tagline: 'Trading apps, real-time data and machine coding.', build: ['Option chain table with live updates', 'Price alert creation form'], design: ['Design a real-time portfolio page', 'Design an onboarding and KYC flow'] },
  { id: 'policybazaar', name: 'PolicyBazaar', category: 'FINTECH', archetype: 'MACHINE_CODING', tagline: 'Comparison funnels and conversion-focused UIs.', build: ['Insurance plan comparison table', 'Multi-step quote form with progress'], design: ['Design an insurance comparison funnel', 'Design a lead capture flow optimised for SEO'] },
  { id: 'mobikwik', name: 'MobiKwik', category: 'FINTECH', archetype: 'STARTUP', tagline: 'Wallet and payments flows on mobile web.', build: ['Wallet top-up with amount chips', 'Bill payment form with saved billers'], design: ['Design a wallet home screen', 'Design a buy-now-pay-later checkout'] },
  { id: 'bharatpe', name: 'BharatPe', category: 'FINTECH', archetype: 'STARTUP', tagline: 'Merchant payments and lending experiences.', build: ['Merchant settlement history list', 'Loan eligibility form'], design: ['Design a merchant dashboard for small shops', 'Design a QR payments transaction view'] },
  { id: 'slice', name: 'slice', category: 'FINTECH', archetype: 'STARTUP', tagline: 'Design-led fintech with polished interactions.', build: ['Animated spend summary card', 'Repayment schedule view'], design: ['Design a card spends and rewards app', 'Design a savings goals feature'] },
  { id: 'jupiter', name: 'Jupiter', category: 'FINTECH', archetype: 'STARTUP', tagline: 'Neobank UIs with clean React architecture.', build: ['Spending categories donut and list', 'Pots / savings jar creation flow'], design: ['Design a neobank home with insights', 'Design salary-day automation settings'] },
  { id: 'navi', name: 'Navi', category: 'FINTECH', archetype: 'MACHINE_CODING', tagline: 'Lending and insurance flows built for scale.', build: ['Loan EMI calculator with sliders', 'Document upload with progress and retry'], design: ['Design an instant loan application flow', 'Design a health insurance claims tracker'] },
  { id: 'indmoney', name: 'INDmoney', category: 'FINTECH', archetype: 'STARTUP', tagline: 'Wealth tracking and investing interfaces.', build: ['Net worth breakdown with charts', 'US stock search with suggestions'], design: ['Design a family net-worth tracker', 'Design a goal-based investing flow'] },
  { id: 'pine-labs', name: 'Pine Labs', category: 'FINTECH', archetype: 'ENTERPRISE', tagline: 'Merchant platforms and payment dashboards.', build: ['Terminal transactions table with export', 'Offer configuration form'], design: ['Design a merchant analytics portal', 'Design a gift card management console'] },
  { id: 'zeta', name: 'Zeta', category: 'FINTECH', archetype: 'ENTERPRISE', tagline: 'Banking-as-a-service platforms and components.', build: ['Card issuance form for bank admins', 'Configurable rules editor'], design: ['Design a white-label banking app framework', 'Design a bank operations console'] },
  { id: 'acko', name: 'Acko', category: 'FINTECH', archetype: 'STARTUP', tagline: 'Digital insurance funnels and claims UX.', build: ['Car insurance quote form with vehicle lookup', 'Claim status timeline'], design: ['Design a fully digital insurance purchase flow', 'Design a self-serve claims experience'] },
  { id: 'jar', name: 'Jar', category: 'FINTECH', archetype: 'STARTUP', tagline: 'Micro-savings with delightful, simple UI.', build: ['Daily savings streak tracker', 'Gold price card with buy flow'], design: ['Design an automated round-up savings feature', 'Design a gamified savings journey'] },
  // Indian product companies
  { id: 'myntra', name: 'Myntra', category: 'INDIAN_PRODUCT', archetype: 'MACHINE_CODING', tagline: 'Fashion e-commerce, machine coding and performance.', build: ['Product listing with size and brand filters', 'Wishlist with move-to-bag'], design: ['Design a fashion product listing page for sale events', 'Design a virtual try-on entry experience'] },
  { id: 'nykaa', name: 'Nykaa', category: 'INDIAN_PRODUCT', archetype: 'MACHINE_CODING', tagline: 'Beauty commerce with rich content and UGC.', build: ['Product reviews with photo uploads', 'Shade selector component'], design: ['Design a content-plus-commerce product page', 'Design a loyalty and offers hub'] },
  { id: 'reliance-jio', name: 'Reliance Jio', category: 'INDIAN_PRODUCT', archetype: 'ENTERPRISE', tagline: 'Massive-scale consumer apps and platforms.', build: ['Recharge plans browser with comparisons', 'Content carousel for a TV app'], design: ['Design a super-app shell hosting many services', 'Design a streaming app for low bandwidth'] },
  { id: 'jiohotstar', name: 'JioHotstar', category: 'INDIAN_PRODUCT', archetype: 'DSA_HEAVY', tagline: 'Streaming at cricket-final scale.', build: ['Live score overlay updating in real time', 'Episode list with continue-watching'], design: ['Design a live sports streaming page for tens of millions', 'Design a personalised home with trays'] },
  { id: 'tata-1mg', name: 'Tata 1mg', category: 'INDIAN_PRODUCT', archetype: 'MACHINE_CODING', tagline: 'Health commerce and SEO-heavy pages.', build: ['Medicine search with substitutes', 'Prescription upload with preview'], design: ['Design an SEO-friendly medicine detail page', 'Design a lab test booking flow'] },
  { id: 'pharmeasy', name: 'PharmEasy', category: 'INDIAN_PRODUCT', archetype: 'MACHINE_CODING', tagline: 'Healthcare ordering flows and machine coding.', build: ['Cart with prescription-required items', 'Delivery slot selector'], design: ['Design a medicine reorder experience', 'Design a diagnostics booking funnel'] },
  { id: 'practo', name: 'Practo', category: 'INDIAN_PRODUCT', archetype: 'STARTUP', tagline: 'Doctor discovery and appointment booking.', build: ['Doctor slot picker by day', 'Clinic search with filters'], design: ['Design a doctor discovery and booking flow', 'Design a video consultation web client'] },
  { id: 'lenskart', name: 'Lenskart', category: 'INDIAN_PRODUCT', archetype: 'MACHINE_CODING', tagline: 'Eyewear commerce with interactive product UIs.', build: ['Frame filter with shape and size', 'Lens package selector with price updates'], design: ['Design a 3D try-on product page', 'Design an omnichannel store-pickup flow'] },
  { id: 'urban-company', name: 'Urban Company', category: 'INDIAN_PRODUCT', archetype: 'MACHINE_CODING', tagline: 'Service booking flows and strong machine coding.', build: ['Service package builder with add-ons', 'Time-slot picker with availability'], design: ['Design a home services booking flow', 'Design a professional partner app web view'] },
  { id: 'ola', name: 'Ola', category: 'INDIAN_PRODUCT', archetype: 'MACHINE_CODING', tagline: 'Mobility UIs with maps and real-time state.', build: ['Ride type selector with fare estimates', 'Saved places manager'], design: ['Design a ride booking web app with live tracking', 'Design an EV scooter purchase flow'] },
  { id: 'rapido', name: 'Rapido', category: 'INDIAN_PRODUCT', archetype: 'STARTUP', tagline: 'Fast-moving mobility products.', build: ['Pickup and drop location search', 'Ride history list with filters'], design: ['Design a bike-taxi booking flow on mobile web', 'Design a captain earnings dashboard'] },
  { id: 'makemytrip', name: 'MakeMyTrip', category: 'INDIAN_PRODUCT', archetype: 'MACHINE_CODING', tagline: 'Travel search, SSR and machine coding.', build: ['Flight results with filters and sort', 'Seat map selector'], design: ['Design a flight search results page', 'Design a holiday package builder'] },
  { id: 'cleartrip', name: 'Cleartrip', category: 'INDIAN_PRODUCT', archetype: 'MACHINE_CODING', tagline: 'Clean, fast travel booking UIs.', build: ['Fare calendar with lowest prices', 'Traveller details form'], design: ['Design a fast flight booking flow', 'Design a trip itinerary page'] },
  { id: 'oyo', name: 'OYO', category: 'INDIAN_PRODUCT', archetype: 'MACHINE_CODING', tagline: 'Hotel booking and partner tools.', build: ['Hotel listing with map toggle', 'Coupon apply widget'], design: ['Design a budget hotel search experience', 'Design a hotel owner dashboard'] },
  { id: 'ixigo', name: 'ixigo', category: 'INDIAN_PRODUCT', archetype: 'STARTUP', tagline: 'Train and travel utilities at scale.', build: ['Train availability grid by class', 'PNR status tracker'], design: ['Design a train search and booking flow', 'Design a running-status tracker'] },
  { id: 'bigbasket', name: 'BigBasket', category: 'INDIAN_PRODUCT', archetype: 'MACHINE_CODING', tagline: 'Grocery commerce and large catalogues.', build: ['Category browser with quantity steppers', 'Smart basket suggestions list'], design: ['Design a grocery catalogue with thousands of SKUs', 'Design a scheduled delivery checkout'] },
  { id: 'blinkit', name: 'Blinkit', category: 'INDIAN_PRODUCT', archetype: 'MACHINE_CODING', tagline: 'Quick-commerce speed and live inventory.', build: ['Product grid with live stock badges', 'Cart with out-of-stock reconciliation'], design: ['Design a 10-minute delivery storefront', 'Design an order tracking page with rider location'] },
  { id: 'licious', name: 'Licious', category: 'INDIAN_PRODUCT', archetype: 'STARTUP', tagline: 'D2C commerce with delivery slots.', build: ['Product cut selector with weights', 'Delivery slot picker'], design: ['Design a D2C storefront with subscriptions', 'Design a recipe-to-cart experience'] },
  { id: 'delhivery', name: 'Delhivery', category: 'INDIAN_PRODUCT', archetype: 'ENTERPRISE', tagline: 'Logistics dashboards and operations tools.', build: ['Shipment tracking timeline', 'Bulk shipment upload with validation'], design: ['Design a logistics control tower dashboard', 'Design a shipper self-serve portal'] },
  { id: 'cardekho', name: 'CarDekho', category: 'INDIAN_PRODUCT', archetype: 'MACHINE_CODING', tagline: 'Auto marketplace with SEO and comparisons.', build: ['Car comparison table', 'Used car filters with price range'], design: ['Design an SEO-heavy car model page', 'Design a used-car listing marketplace'] },
  { id: 'cars24', name: 'Cars24', category: 'INDIAN_PRODUCT', archetype: 'MACHINE_CODING', tagline: 'Used-car buying and selling flows.', build: ['Car inspection report viewer', 'Sell-car valuation form'], design: ['Design a used-car buying funnel', 'Design a test-drive booking flow'] },
  { id: 'info-edge', name: 'Info Edge (Naukri)', category: 'INDIAN_PRODUCT', archetype: 'MACHINE_CODING', tagline: 'Job search, SEO and recruiter tools.', build: ['Job search with filters and saved searches', 'Resume upload with parsing preview'], design: ['Design a job search results page', 'Design a recruiter candidate pipeline'] },
  { id: 'dream11', name: 'Dream11', category: 'INDIAN_PRODUCT', archetype: 'MACHINE_CODING', tagline: 'Fantasy sports under massive traffic spikes.', build: ['Team builder with role constraints and credits', 'Live leaderboard with rank changes'], design: ['Design a contest page for a cricket final', 'Design live score and points updates'] },
  { id: 'mpl', name: 'MPL', category: 'INDIAN_PRODUCT', archetype: 'STARTUP', tagline: 'Gaming platform UIs and real-time features.', build: ['Tournament list with countdowns', 'Wallet with deposit and withdraw states'], design: ['Design a multi-game tournament platform', 'Design a real-time leaderboard'] },
  { id: 'games24x7', name: 'Games24x7', category: 'INDIAN_PRODUCT', archetype: 'DSA_HEAVY', tagline: 'Game UIs, DSA and performance.', build: ['Card game table layout with animations', 'Lobby with filters and quick join'], design: ['Design a real-time multiplayer game lobby', 'Design a responsible-gaming limits feature'] },
  { id: 'sharechat', name: 'ShareChat', category: 'INDIAN_PRODUCT', archetype: 'DSA_HEAVY', tagline: 'Vernacular social feeds at huge scale.', build: ['Short-video feed with autoplay in view', 'Language selector with transliteration'], design: ['Design a vernacular content feed', 'Design a live audio rooms experience'] },
  { id: 'inmobi', name: 'InMobi', category: 'INDIAN_PRODUCT', archetype: 'DSA_HEAVY', tagline: 'Ad-tech dashboards and lock-screen experiences.', build: ['Campaign performance table with charts', 'Ad preview builder'], design: ['Design an advertiser campaign manager', 'Design a lightweight content feed for lock screens'] },
  { id: 'unacademy', name: 'Unacademy', category: 'INDIAN_PRODUCT', archetype: 'MACHINE_CODING', tagline: 'Live learning and video-first products.', build: ['Course curriculum accordion with progress', 'Live class chat with polls'], design: ['Design a live class experience for thousands of learners', 'Design a test series and results page'] },
  { id: 'physicswallah', name: 'PhysicsWallah', category: 'INDIAN_PRODUCT', archetype: 'STARTUP', tagline: 'Affordable ed-tech at massive scale.', build: ['Batch listing with filters', 'Doubt submission with image upload'], design: ['Design a video lecture platform for low bandwidth', 'Design a practice quiz engine'] },
  { id: 'upgrad', name: 'upGrad', category: 'INDIAN_PRODUCT', archetype: 'STARTUP', tagline: 'Online degree and learning platforms.', build: ['Program comparison cards', 'Assignment submission flow'], design: ['Design a learner dashboard', 'Design a course discovery and lead funnel'] },
  { id: 'vedantu', name: 'Vedantu', category: 'INDIAN_PRODUCT', archetype: 'STARTUP', tagline: 'Interactive live tutoring products.', build: ['Interactive whiteboard toolbar', 'Class schedule calendar'], design: ['Design a live interactive classroom', 'Design a parent progress report'] },
  { id: 'zoho', name: 'Zoho', category: 'SAAS_ENTERPRISE', archetype: 'ENTERPRISE', tagline: 'Product suite engineering with strong fundamentals.', build: ['Spreadsheet-like editable grid', 'Email compose with attachments'], design: ['Design a web-based office suite shell', 'Design a CRM pipeline board'] },
  { id: 'freshworks', name: 'Freshworks', category: 'SAAS_ENTERPRISE', archetype: 'ENTERPRISE', tagline: 'Customer-service SaaS and reusable components.', build: ['Ticket detail view with conversation thread', 'Canned responses picker'], design: ['Design a helpdesk agent workspace', 'Design an embeddable support widget'] },
  { id: 'postman', name: 'Postman', category: 'SAAS_ENTERPRISE', archetype: 'MACHINE_CODING', tagline: 'Developer tools with complex editors.', build: ['Request builder with params and headers tabs', 'JSON response viewer with collapse'], design: ['Design an API client in the browser', 'Design collaborative workspaces with sync'] },
  { id: 'browserstack', name: 'BrowserStack', category: 'SAAS_ENTERPRISE', archetype: 'MACHINE_CODING', tagline: 'Testing infrastructure and dev-tool UIs.', build: ['Test run results table with logs', 'Device and browser picker'], design: ['Design a live browser testing session UI', 'Design a test analytics dashboard'] },
  { id: 'chargebee', name: 'Chargebee', category: 'SAAS_ENTERPRISE', archetype: 'ENTERPRISE', tagline: 'Subscription billing and finance UIs.', build: ['Plan and add-on configurator', 'Invoice list with status filters'], design: ['Design a subscription management portal', 'Design a revenue analytics dashboard'] },
  { id: 'innovaccer', name: 'Innovaccer', category: 'SAAS_ENTERPRISE', archetype: 'ENTERPRISE', tagline: 'Healthcare data platforms and design systems.', build: ['Patient list with risk filters', 'Care plan task checklist'], design: ['Design a care coordination dashboard', 'Design a healthcare design system'] },
  { id: 'harness', name: 'Harness', category: 'SAAS_ENTERPRISE', archetype: 'DSA_HEAVY', tagline: 'CI/CD platforms and pipeline UIs.', build: ['Pipeline stage graph viewer', 'Deployment logs streaming viewer'], design: ['Design a visual pipeline editor', 'Design a deployment verification dashboard'] },
  { id: 'rippling', name: 'Rippling', category: 'SAAS_ENTERPRISE', archetype: 'DSA_HEAVY', tagline: 'Workforce platform with demanding coding rounds.', build: ['Employee directory with custom fields', 'Approval chain editor'], design: ['Design an HR platform with app integrations', 'Design a policy rules builder'] },
  { id: 'tekion', name: 'Tekion', category: 'SAAS_ENTERPRISE', archetype: 'MACHINE_CODING', tagline: 'Automotive retail cloud and complex workflows.', build: ['Vehicle inventory table with filters', 'Service appointment scheduler'], design: ['Design a dealer management system UI', 'Design a digital car-buying flow'] },
]

function buildCompany(spec: CompanySpec, index: number): Company {
  const archetype = archetypes[spec.archetype]
  const offset = index % 8
  const round = (type: CompanyRoundType, specific: string[], behavioralTopic?: string): CompanyRoundBlueprint => {
    const { baseTopics, ...rest } = archetype.rounds[type]
    return { type, ...rest, topics: [...specific, ...baseTopics(offset)], ...(behavioralTopic ? { behavioralTopic } : {}) }
  }

  return {
    id: spec.id,
    name: spec.name,
    category: spec.category,
    tagline: spec.tagline,
    bar: archetype.bar(spec.name),
    rounds: [
      round('ROUND_1', []),
      round('ROUND_2', [...spec.build]),
      round('SYSTEM_DESIGN', [...spec.design], spec.behavioral),
    ],
  }
}

export const companies: Company[] = [...curatedCompanies, ...companySpecs.map(buildCompany)]

export function findCompany(companyId: unknown): Company | undefined {
  return typeof companyId === 'string' ? companies.find((company) => company.id === companyId) : undefined
}

export function findCompanyRound(company: Company, type: unknown): CompanyRoundBlueprint | undefined {
  return company.rounds.find((round) => round.type === type)
}

export function isCompanyRoleLevel(value: unknown): value is CompanyRoleLevel {
  return value === 'FE1' || value === 'FE2'
}

/** Official website domain per company, used only to load the company's own logo for identification. */
export const companyDomains: Record<string, string> = {
  amazon: 'amazon.com', google: 'google.com', microsoft: 'microsoft.com', apple: 'apple.com', atlassian: 'atlassian.com',
  adobe: 'adobe.com', salesforce: 'salesforce.com', uber: 'uber.com', expedia: 'expedia.com', walmart: 'walmart.com',
  flipkart: 'flipkart.com', phonepe: 'phonepe.com', paytm: 'paytm.com', razorpay: 'razorpay.com', cred: 'cred.club',
  swiggy: 'swiggy.com', zomato: 'zomato.com', meesho: 'meesho.com', zepto: 'zeptonow.com', airtel: 'airtel.in',
  meta: 'meta.com', netflix: 'netflix.com', linkedin: 'linkedin.com', airbnb: 'airbnb.com', booking: 'booking.com',
  agoda: 'agoda.com', oracle: 'oracle.com', 'sap-labs': 'sap.com', cisco: 'cisco.com', intuit: 'intuit.com',
  servicenow: 'servicenow.com', workday: 'workday.com', 'broadcom-vmware': 'vmware.com', nutanix: 'nutanix.com',
  twilio: 'twilio.com', sprinklr: 'sprinklr.com', thoughtworks: 'thoughtworks.com', 'publicis-sapient': 'publicissapient.com',
  paypal: 'paypal.com', visa: 'visa.com', mastercard: 'mastercard.com', amex: 'americanexpress.com',
  'goldman-sachs': 'goldmansachs.com', jpmorgan: 'jpmorganchase.com', 'morgan-stanley': 'morganstanley.com',
  juspay: 'juspay.in', groww: 'groww.in', zerodha: 'zerodha.com', upstox: 'upstox.com', policybazaar: 'policybazaar.com',
  mobikwik: 'mobikwik.com', bharatpe: 'bharatpe.com', slice: 'sliceit.com', jupiter: 'jupiter.money', navi: 'navi.com',
  indmoney: 'indmoney.com', 'pine-labs': 'pinelabs.com', zeta: 'zeta.tech', acko: 'acko.com', jar: 'myjar.app',
  myntra: 'myntra.com', nykaa: 'nykaa.com', 'reliance-jio': 'jio.com', jiohotstar: 'hotstar.com', 'tata-1mg': '1mg.com',
  pharmeasy: 'pharmeasy.in', practo: 'practo.com', lenskart: 'lenskart.com', 'urban-company': 'urbancompany.com',
  ola: 'olacabs.com', rapido: 'rapido.bike', makemytrip: 'makemytrip.com', cleartrip: 'cleartrip.com', oyo: 'oyorooms.com',
  ixigo: 'ixigo.com', bigbasket: 'bigbasket.com', blinkit: 'blinkit.com', licious: 'licious.in', delhivery: 'delhivery.com',
  cardekho: 'cardekho.com', cars24: 'cars24.com', 'info-edge': 'naukri.com', dream11: 'dream11.com', mpl: 'mpl.live',
  games24x7: 'games24x7.com', sharechat: 'sharechat.com', inmobi: 'inmobi.com', unacademy: 'unacademy.com',
  physicswallah: 'pw.live', upgrad: 'upgrad.com', vedantu: 'vedantu.com', zoho: 'zoho.com', freshworks: 'freshworks.com',
  postman: 'postman.com', browserstack: 'browserstack.com', chargebee: 'chargebee.com', innovaccer: 'innovaccer.com',
  harness: 'harness.io', rippling: 'rippling.com', tekion: 'tekion.com',
  openai: 'openai.com', anthropic: 'anthropic.com', 'google-deepmind': 'deepmind.google', nvidia: 'nvidia.com',
  perplexity: 'perplexity.ai', databricks: 'databricks.com', cursor: 'cursor.com', mistral: 'mistral.ai',
  elevenlabs: 'elevenlabs.io', 'scale-ai': 'scale.com',
}
