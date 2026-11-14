/**
 * Company mock-interview catalog, shared by the frontend (company pages) and the backend (interview prompts).
 *
 * Each round is a "blueprint": the format, focus areas and interviewer style that candidates commonly report
 * for that company's frontend loop. Topics are original practice themes written for this app, not leaked or
 * verbatim questions. Interview Buddy is not affiliated with or endorsed by any company listed here.
 */

export type CompanyRoundType = 'ROUND_1' | 'ROUND_2' | 'SYSTEM_DESIGN'

export type CompanyRoleLevel = 'FE1' | 'FE2'

export type CompanyCategory = 'BIG_TECH' | 'INDIAN_PRODUCT' | 'FINTECH' | 'SAAS_ENTERPRISE' | 'STARTUP'

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
  BIG_TECH: 'Big Tech',
  INDIAN_PRODUCT: 'Indian product',
  FINTECH: 'Fintech',
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

export const companies: Company[] = [
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

export function findCompany(companyId: unknown): Company | undefined {
  return typeof companyId === 'string' ? companies.find((company) => company.id === companyId) : undefined
}

export function findCompanyRound(company: Company, type: unknown): CompanyRoundBlueprint | undefined {
  return company.rounds.find((round) => round.type === type)
}

export function isCompanyRoleLevel(value: unknown): value is CompanyRoleLevel {
  return value === 'FE1' || value === 'FE2'
}
