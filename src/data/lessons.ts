import type { Lesson, LessonCard, Topic, Difficulty } from '../types/lesson';


export const LESSONS: Lesson[] = [
  // 1. System Design - Foundational
  {
    id: 'system-design-basics',
    title: 'Load Balancers & Caching 101',
    topic: 'System Design',
    difficulty: 'Foundational',
    durationMinutes: 3,
    subtitle: 'How web apps scale from 1 user to 1 million users',
    cards: [
      {
        id: 'sd1-1',
        type: 'hook',
        headline: 'What happens when a viral post sends 500,000 users to your web app at once?',
        body: 'If your app runs on a single server, it crashes instantly. Scaling requires spreading traffic with Load Balancers and storing frequent answers in Redis Caches.',
        statBadge: { label: 'Scale Factor', value: '1M Users' },
        iconName: 'Server',
        hint: 'Think of a restaurant host giving tables to 5 different waiters.',
        simpleExplanation: 'Imagine a busy post office. Instead of 1 clerk doing all the work, a manager (Load Balancer) hands customer letters to 10 clerks. Answers to common questions are posted on a giant whiteboard (Cache) so clerks don\'t have to look through filing cabinets.'
      },
      {
        id: 'sd1-2',
        type: 'multiple_choice',
        question: 'Which component sits between users and your app servers to distribute traffic evenly?',
        hint: 'It balances incoming network traffic load.',
        simpleExplanation: 'A Load Balancer acts like a traffic cop at a busy intersection, directing cars into different open lanes so no single road gets jammed.',
        options: [
          {
            id: 'sd1-opt1',
            text: 'Load Balancer (e.g. NGINX / AWS ALB)',
            isCorrect: true,
            explanation: 'Correct! A Load Balancer routes incoming requests across multiple healthy app servers.'
          },
          {
            id: 'sd1-opt2',
            text: 'Primary SQL Database',
            isCorrect: false,
            explanation: 'Databases store data; they don\'t distribute web traffic.'
          },
          {
            id: 'sd1-opt3',
            text: 'Browser LocalStorage',
            isCorrect: false,
            explanation: 'LocalStorage only lives on a single user\'s device.'
          }
        ]
      },
      {
        id: 'sd1-3',
        type: 'takeaway',
        oneSentenceSummary: 'Load Balancers distribute traffic across servers while Caches prevent redundant database reads.',
        keyInsights: [
          'Horizontal scaling adds more servers instead of buying 1 giant expensive computer.',
          'Caching in RAM (Redis) is 1000x faster than reading from disk databases.'
        ],
        suggestedNextTopic: 'Frontend'
      }
    ]
  },

  // 2. System Design - Staff Level (Netflix)
  {
    id: 'system-design-netflix',
    title: 'The Architecture Switch That Saved Millions',
    topic: 'System Design',
    difficulty: 'Staff Level',
    durationMinutes: 5,
    subtitle: 'Microservices vs Monolith vs GraphQL Gateway',
    cards: [
      {
        id: 'card-1',
        type: 'hook',
        headline: 'Netflix made one architecture decision that saved millions of dollars.',
        body: 'In 2012, Netflix streaming traffic exploded. Every client app (TV, iOS, Android, Web) required custom API payloads. Legacy REST servers were melting down under redundant payload bloat.',
        statBadge: { label: 'Cost Reduction', value: '40% Infra' },
        iconName: 'Server',
        hint: 'Think about how TVs and phones need very different thumbnail sizes.',
        simpleExplanation: 'Instead of serving one huge 10MB JSON response to a tiny phone that only needs a video title, Netflix created custom translators (BFFs) that send only the 2KB of data each screen asks for.'
      },
      {
        id: 'card-2',
        type: 'multiple_choice',
        question: 'What do you think Netflix changed in their API architecture?',
        hint: 'They customized backend endpoints for each specific device client.',
        simpleExplanation: 'Backend-For-Frontend (BFF) gives each device type its own customized API tailor, preventing bloated networks.',
        options: [
          {
            id: 'opt-a',
            text: 'Replaced REST endpoints with client-customized API Adapters (BFF / GraphQL)',
            isCorrect: true,
            explanation: 'Correct! By adopting Backend-For-Frontend (BFF) API scripts, each device requested only the exact bytes it needed.'
          },
          {
            id: 'opt-b',
            text: 'Moved all microservices back into a single giant Ruby on Rails monolith',
            isCorrect: false,
            explanation: 'Monoliths reduce network hops, but Netflix needed independent team deployments across hundreds of microservices.'
          },
          {
            id: 'opt-c',
            text: 'Switched from TCP to UDP for all API metadata requests',
            isCorrect: false,
            explanation: 'UDP loses packets! API payload metadata requires reliable HTTP/TCP delivery.'
          }
        ]
      },
      {
        id: 'card-3',
        type: 'spot_the_mistake',
        question: 'Spot The Bottleneck',
        subtitle: 'Tap the component causing a cache stampede during peak hours.',
        instruction: 'Tap the vulnerable component in this microservice flow:',
        contextCodeOrDiagram: {
          type: 'diagram',
          content: 'User App -> API Gateway -> DB Query (Uncached Hot Spot)',
          nodes: [
            { id: 'node-gw', label: 'API Gateway', isMistake: false, subtext: 'Rate limiting OK' },
            { id: 'node-svc', label: 'Video Catalog Service', isMistake: false, subtext: 'Auto-scaled' },
            { id: 'node-db', label: 'Primary SQL DB (Direct Query)', isMistake: true, subtext: '100k QPS hitting raw disk!' },
            { id: 'node-queue', label: 'Async Log Queue', isMistake: false, subtext: 'Decoupled' }
          ]
        },
        explanation: 'Directly querying the primary database without an in-memory Redis cluster or read replica caused catastrophic lock contention on hot video metadata!'
      },
      {
        id: 'card-3b',
        type: 'debug_session',
        bugTitle: 'Concurrency Deadlock in Video Access Token Verification',
        symptom: '1 in 50 concurrent video stream requests freeze indefinitely until timeout.',
        stackTraceOrLog: 'ERROR 2026-08-02 21:04:12 [auth_worker_pool] DeadlockDetected: Thread-42 waiting on lock held by Thread-19\n  at verify_and_renew_token (auth_service.py:14)',
        codeSnippet: {
          filename: 'auth_service.py',
          language: 'python',
          lines: [
            { lineNumber: 10, code: 'def verify_and_renew_token(user_id, token):', isBuggyLine: false },
            { lineNumber: 11, code: '    user_lock.acquire()', isBuggyLine: false },
            { lineNumber: 12, code: '    session = db.get_session(user_id)', isBuggyLine: false },
            { lineNumber: 13, code: '    db_lock.acquire()  # Acquires DB lock while holding user lock', isBuggyLine: false },
            { lineNumber: 14, code: '    token_lock.acquire() # Re-acquires locks out-of-order!', isBuggyLine: true },
            { lineNumber: 15, code: '    return session.renew()', isBuggyLine: false }
          ]
        },
        fixOptions: [
          {
            id: 'fix-1',
            patchCode: 'Enforce strict lock ordering: acquire token_lock -> user_lock -> db_lock',
            isCorrectFix: true,
            explanation: 'Correct! Circular wait deadlocks are eliminated by establishing a single global lock acquisition order.'
          },
          {
            id: 'fix-2',
            patchCode: 'Wrap token_lock.acquire() in time.sleep(0.5)',
            isCorrectFix: false,
            explanation: 'Adding sleep only delays the lock contention and degrades throughput further.'
          }
        ],
        explanation: 'Acquiring multiple locks in inconsistent order causes classic circular-wait deadlocks under high concurrency. Enforcing global lock order or using atomic CAS operations resolves thread stalls.'
      },
      {
        id: 'card-4',
        type: 'takeaway',
        oneSentenceSummary: 'Decoupling APIs with BFFs, caching aggressively, and isolating failure with circuit breakers makes systems bulletproof at scale.',
        keyInsights: [
          'Clients should only fetch the exact fields they render.',
          'Always isolate database read hotspots with in-memory caching.'
        ],
        suggestedNextTopic: 'AI & LLMs'
      }
    ]
  },

  // 3. Frontend Architecture - Foundational / Intermediate
  {
    id: 'frontend-performance',
    title: 'Core Web Vitals & Rendering Performance',
    topic: 'Frontend',
    difficulty: 'Intermediate',
    durationMinutes: 3,
    subtitle: 'LCP, INP, CLS, & Virtual DOM Bottlenecks',
    cards: [
      {
        id: 'fe-1',
        type: 'hook',
        headline: 'Why does tapping a button feel laggy on some web apps?',
        body: 'When JavaScript blocks the browser main thread for over 50ms, input responsiveness drops. Google measures this as Interaction to Next Paint (INP).',
        statBadge: { label: 'Target INP', value: '< 200ms' },
        iconName: 'Zap',
        hint: 'Long loops on the browser thread freeze user input handlers.',
        simpleExplanation: 'The web browser is like a single-lane highway. If a giant heavy JavaScript calculation is driving down that lane, your tap clicks have to wait in line behind it until it finishes.'
      },
      {
        id: 'fe-2',
        type: 'multiple_choice',
        question: 'Which technique prevents heavy calculations from freezing the main UI thread?',
        options: [
          {
            id: 'fe-opt1',
            text: 'Offload heavy work to Web Workers or use requestIdleCallback()',
            isCorrect: true,
            explanation: 'Correct! Web Workers run in background threads, leaving the main UI thread free to respond to user touches instantly.'
          },
          {
            id: 'fe-opt2',
            text: 'Wrap all code in a infinite while(true) loop',
            isCorrect: false,
            explanation: 'An infinite loop will permanently freeze the browser tab!'
          }
        ]
      },
      {
        id: 'fe-3',
        type: 'takeaway',
        oneSentenceSummary: 'Keep the main thread clear of heavy work to achieve sub-100ms INP and snappy mobile UI interaction.',
        keyInsights: [
          'Use Web Workers for CPU-heavy tasks like image processing or large array sorting.',
          'Break long tasks into small chunks with requestAnimationFrame or scheduler.yield().'
        ],
        suggestedNextTopic: 'DevOps'
      }
    ]
  },

  // 4. DevOps & Cloud - Foundational
  {
    id: 'devops-cicd-k8s',
    title: 'CI/CD Pipelines & Containerization',
    topic: 'DevOps',
    difficulty: 'Foundational',
    durationMinutes: 3,
    subtitle: 'Docker, GitHub Actions, & Zero-Downtime Deployments',
    cards: [
      {
        id: 'do-1',
        type: 'hook',
        headline: 'It worked on my machine! Why did it break in production?',
        body: 'Inconsistent operating environments cause software bugs. Docker packages code and its dependencies into isolated containers that run identically anywhere.',
        statBadge: { label: 'Reliability', value: '100% Consistent' },
        iconName: 'Layers',
        hint: 'Shipping containers allow ships to carry any goods without custom packing.',
        simpleExplanation: 'Docker is like a lunchbox. Instead of bringing ingredients and cooking at school (where spices might be missing), you pack the complete meal at home so it tastes exact same everywhere.'
      },
      {
        id: 'do-2',
        type: 'match_pairs',
        instruction: 'Match each DevOps term to its core role:',
        pairs: [
          { id: 'dp-1', left: 'Docker Container', right: 'Packaged app runtime environment' },
          { id: 'dp-2', left: 'CI/CD Pipeline', right: 'Automated test & deployment workflow' },
          { id: 'dp-3', left: 'Kubernetes', right: 'Container orchestration & auto-scaling' }
        ],
        explanation: 'Spot on! Docker wraps the app, CI/CD tests and ships it, and Kubernetes keeps container replicas alive under load.'
      },
      {
        id: 'do-3',
        type: 'takeaway',
        oneSentenceSummary: 'Automated CI/CD pipelines and Docker containers ensure code deploys safely without manual server tinkering.',
        keyInsights: [
          'Never SSH into production servers to manually edit code.',
          'Containerized builds eliminate environment discrepancy bugs.'
        ],
        suggestedNextTopic: 'Security'
      }
    ]
  },

  // 5. Security & Auth - Intermediate
  {
    id: 'security-jwt-oauth',
    title: 'Web Security: JWTs, XSS, & CSRF',
    topic: 'Security',
    difficulty: 'Intermediate',
    durationMinutes: 3,
    subtitle: 'Securing API Tokens & Preventing Exploit Injections',
    cards: [
      {
        id: 'sec-1',
        type: 'hook',
        headline: 'Storing secret auth tokens in LocalStorage opens your app to XSS theft.',
        body: 'If a malicious third-party script runs on your page (XSS), it can read `localStorage.getItem("token")` and impersonate your users. Storing tokens in `HttpOnly` cookies blocks JS access.',
        statBadge: { label: 'Security Grade', value: 'A+ Rated' },
        iconName: 'ShieldCheck',
        hint: 'JavaScript cannot read cookies flagged with HttpOnly.',
        simpleExplanation: 'Storing a key in LocalStorage is like leaving house keys on the front porch table. Any script on the page can grab it. HttpOnly cookies put the key inside a secure safe that only the browser network engine can touch.'
      },
      {
        id: 'sec-2',
        type: 'choose_the_tradeoff',
        scenario: 'Where should authentication JWT tokens be stored in modern web applications?',
        options: [
          {
            id: 'sec-opt1',
            title: 'HttpOnly, Secure, SameSite Cookies',
            pros: ['Inaccessible to malicious XSS JavaScript scripts', 'Sent automatically with HTTPS'],
            cons: ['Requires CSRF protection tokens'],
            isBestChoice: true,
            why: 'HttpOnly cookies prevent attackers from stealing user session tokens via Cross-Site Scripting (XSS).'
          },
          {
            id: 'sec-opt2',
            title: 'Browser LocalStorage',
            pros: ['Easy to read with JS'],
            cons: ['Vulnerable to XSS theft by third-party scripts'],
            isBestChoice: false,
            why: 'Any compromised npm package or script can dump all LocalStorage secrets.'
          }
        ]
      },
      {
        id: 'sec-3',
        type: 'takeaway',
        oneSentenceSummary: 'Protect authentication tokens using HttpOnly cookies and sanitize user input to prevent XSS and SQL injection.',
        keyInsights: [
          'Never store sensitive session JWT tokens in plain LocalStorage.',
          'Always set SameSite=Strict or Lax on cookies to mitigate CSRF attacks.'
        ],
        suggestedNextTopic: 'System Design'
      }
    ]
  },

  // 6. AI & LLMs - Intermediate
  {
    id: 'ai-rag-vector',
    title: 'Why RAG Breaks at Scale & How Vector Indexing Fixes It',
    topic: 'AI & LLMs',
    difficulty: 'Intermediate',
    durationMinutes: 5,
    subtitle: 'Embeddings, HNSW Indexing, & Context Windows',
    cards: [
      {
        id: 'ai-card-1',
        type: 'hook',
        headline: 'Most production RAG systems fail because they search vectors like a high school library.',
        body: 'When your vector database grows to 10M embeddings, brute-force cosine similarity takes seconds per prompt. Speeding it up requires Approximate Nearest Neighbors (ANN).',
        statBadge: { label: 'Query Speedup', value: '100x Faster' },
        iconName: 'Sparkles',
        simpleExplanation: 'Searching through 10 million items one by one is slow. Vector databases build a interconnected graph roadmap (HNSW) so the search jumps directly to the right neighborhood in 3 milliseconds.'
      },
      {
        id: 'ai-card-2',
        type: 'match_pairs',
        instruction: 'Match each AI Vector concept to its core definition:',
        pairs: [
          { id: 'p-1', left: 'Embedding', right: 'Dense numerical vector representation of semantic meaning' },
          { id: 'p-2', left: 'HNSW Index', right: 'Graph-based skip-list structure for sub-millisecond ANN search' },
          { id: 'p-3', left: 'Reranking', right: 'Cross-encoder scoring to filter top retrieval results' }
        ],
        explanation: 'Brilliant! Embeddings represent meaning, HNSW graph index enables fast search, and Rerankers refine accuracy.'
      },
      {
        id: 'ai-card-3',
        type: 'takeaway',
        oneSentenceSummary: 'RAG performance depends more on smart chunking, fast vector indexing (HNSW), and reranking than on raw LLM model size.',
        keyInsights: [
          'HNSW graphs turn O(N) brute force search into O(log N) sub-millisecond retrieval.',
          'Hybrid search (Keywords + Vectors) prevents missing exact product serial numbers.'
        ],
        suggestedNextTopic: 'Backend'
      }
    ]
  },

  // 7. Backend - Staff Level
  {
    id: 'backend-cache-stampede',
    title: 'Solving the Cache Stampede in Distributed Systems',
    topic: 'Backend',
    difficulty: 'Staff Level',
    durationMinutes: 3,
    subtitle: 'Mutex Locking, Probabilistic Early Expiration (XFetch)',
    cards: [
      {
        id: 'b-1',
        type: 'hook',
        headline: 'What happens when a cached Redis key holding homepage data expires at 12:00:00 PM?',
        body: '100,000 concurrent user requests simultaneously miss the cache and hit the underlying SQL database at the exact same millisecond. This is the Cache Stampede (Dog-piling).',
        statBadge: { label: 'DB Outage Risk', value: 'Critical' },
        iconName: 'Zap',
        simpleExplanation: 'When the popular cache key dies, thousands of threads try to rebuild it at the exact same instant, crashing the database under a stampede of identical queries.'
      },
      {
        id: 'b-2',
        type: 'multiple_choice',
        question: 'Which technique effectively prevents 10,000 threads from recalculating the exact same expired cache value simultaneously?',
        options: [
          {
            id: 'mc-1',
            text: 'Distributed Mutex Lock (Single worker recomputes, others wait)',
            isCorrect: true,
            explanation: 'Correct! The first request acquires a lock (e.g. Redis SETNX), computes the key, and populates the cache while others read the stale or cached result.'
          },
          {
            id: 'mc-2',
            text: 'Increase Redis RAM capacity from 16GB to 64GB',
            isCorrect: false,
            explanation: 'More RAM does not prevent keys from expiring or stop the stampede when expiration occurs.'
          }
        ]
      },
      {
        id: 'b-3',
        type: 'takeaway',
        oneSentenceSummary: 'Protect your databases from cache stampedes by using distributed locks (SETNX) or probabilistic background refresh (XFetch algorithm).',
        keyInsights: [
          'Never let multiple workers compute an expired cache key in parallel.',
          'Always set random TTL jitter (e.g. 300s ± 15s) so keys don\'t expire at the exact same second.'
        ],
        suggestedNextTopic: 'Product'
      }
    ]
  },

  // 8. Product - Foundational
  {
    id: 'product-latency-conversion',
    title: 'The Latency Paradox: Why 100ms Kills Conversion',
    topic: 'Product',
    difficulty: 'Foundational',
    durationMinutes: 3,
    subtitle: 'Optimistic UI, Skeleton Screens, & Edge Rendering',
    cards: [
      {
        id: 'p-1',
        type: 'hook',
        headline: 'Amazon discovered that every 100ms of latency cost them 1% in sales revenue.',
        body: 'Perceived performance matters more than actual network roundtrips. Modern software engineering requires designing UI state transitions that feel instantaneous.',
        statBadge: { label: 'Revenue Impact', value: '-1% / 100ms' },
        iconName: 'TrendingUp',
        simpleExplanation: 'When you tap "Like" on Twitter/Instagram, the heart lights up immediately without waiting for the server to reply. This is Optimistic UI.'
      },
      {
        id: 'p-2',
        type: 'takeaway',
        oneSentenceSummary: 'Great software engineers design for perceived latency with Optimistic UI, skeleton loaders, and edge caching.',
        keyInsights: [
          'Update UI immediately on user action; handle network errors asynchronously.',
          'Skeleton screens outperform generic loading spinners in user retention.'
        ],
        suggestedNextTopic: 'System Design'
      }
    ]
  }
];

// Helper to generate a dynamic custom lesson deck for user-entered topics
function createCustomDynamicLesson(customTopic: string, difficulty: Difficulty): Lesson {
  const formattedTopic = customTopic.trim();
  const capTopic = formattedTopic.charAt(0).toUpperCase() + formattedTopic.slice(1);

  return {
    id: `custom-${Date.now()}`,
    title: `${capTopic}: Architecture & Core Principles`,
    topic: capTopic,
    difficulty: difficulty || 'Foundational',
    durationMinutes: 5,
    subtitle: `Bite-sized micro-challenge for ${capTopic}`,
    cards: [
      {
        id: 'cust-1',
        type: 'hook',
        headline: `Why ${capTopic} is essential in modern software engineering systems.`,
        body: `Understanding ${capTopic} helps developers build scalable, resilient, and performant applications. Mastering its core trade-offs prevents production surprises under high traffic.`,
        statBadge: { label: 'Custom Challenge', value: capTopic },
        iconName: 'Sparkles',
        simpleExplanation: `${capTopic} is a core pattern designed to make complex software reliable, fast, and easy to maintain.`
      },
      {
        id: 'cust-2',
        type: 'multiple_choice',
        question: `What is the primary architectural advantage of adopting ${capTopic}?`,
        hint: `Focus on how ${capTopic} handles system complexity or performance bottlenecks.`,
        simpleExplanation: `${capTopic} isolates complexity, allowing individual components to scale independently without bottlenecking the entire application.`,
        options: [
          {
            id: 'cust-opt1',
            text: `Decouples core components and improves system throughput for ${capTopic}`,
            isCorrect: true,
            explanation: `Correct! ${capTopic} enables clear separation of concerns, improving performance and maintainability.`
          },
          {
            id: 'cust-opt2',
            text: `Guarantees zero hardware energy consumption`,
            isCorrect: false,
            explanation: 'All software execution consumes compute and memory resources.'
          },
          {
            id: 'cust-opt3',
            text: 'Replaces all source code with automatic AI generation',
            isCorrect: false,
            explanation: `Architectures still require sound software engineering principles.`
          }
        ]
      },
      {
        id: 'cust-3',
        type: 'build_the_system',
        task: `Assemble a High-Throughput ${capTopic} Pipeline`,
        subtitle: 'Tap components to place them in their proper pipeline order:',
        availableBlocks: [
          { id: 'cb-1', label: `${capTopic} Ingress Gateway`, icon: 'Layers' },
          { id: 'cb-2', label: 'In-Memory Cache (Redis)', icon: 'Database' },
          { id: 'cb-3', label: 'Async Event Queue (Kafka)', icon: 'Cpu' },
          { id: 'cb-4', label: 'Persistent Datastore', icon: 'HardDrive' }
        ],
        targetSlots: [
          { slotId: 'cs-1', label: '1. API Ingress Gateway', correctBlockId: 'cb-1' },
          { slotId: 'cs-2', label: '2. High-Speed RAM Cache', correctBlockId: 'cb-2' },
          { slotId: 'cs-3', label: '3. Event Streaming Queue', correctBlockId: 'cb-3' },
          { slotId: 'cs-4', label: '4. Persistent Storage', correctBlockId: 'cb-4' }
        ],
        explanation: `Excellent assembly! Ingress traffic hits the ${capTopic} Gateway, reads cached keys, streams events asynchronously, and persists data cleanly.`
      },
      {
        id: 'cust-4',
        type: 'takeaway',
        oneSentenceSummary: `Mastering ${capTopic} gives engineers a powerful tool for building scalable and maintainable architectures.`,
        keyInsights: [
          `Decouple components using ${capTopic} best practices.`,
          'Always evaluate network and storage trade-offs before scaling in production.'
        ],
        suggestedNextTopic: 'System Design'
      }
    ]
  };
}

export function getLessonByTopicAndDifficulty(
  topic: Topic,
  difficulty?: Difficulty
): Lesson {
  let selectedLesson: Lesson;

  if (topic === 'Surprise Me') {
    const randomIndex = Math.floor(Math.random() * LESSONS.length);
    selectedLesson = { ...LESSONS[randomIndex] };
  } else {
    const searchKey = topic.toLowerCase().trim();
    const match = LESSONS.find(
      (l) => l.topic.toLowerCase() === searchKey || searchKey.includes(l.topic.toLowerCase())
    );

    if (match) {
      if (difficulty) {
        const diffMatch = LESSONS.find(
          (l) => l.topic.toLowerCase() === match.topic.toLowerCase() && l.difficulty === difficulty
        );
        selectedLesson = diffMatch ? { ...diffMatch } : { ...match };
      } else {
        selectedLesson = { ...match };
      }
    } else {
      selectedLesson = createCustomDynamicLesson(topic, difficulty || 'Foundational');
    }
  }

  // Filter out takeaway cards
  return {
    ...selectedLesson,
    cards: selectedLesson.cards.filter((c) => c.type !== 'takeaway')
  };
}

export function getLessonByTopicAndDuration(
  topic: Topic,
  _durationMinutes: number,
  difficulty?: Difficulty
): Lesson {
  return getLessonByTopicAndDifficulty(topic, difficulty);
}

export function getInitialPracticeSession(
  topic: Topic,
  difficulty: Difficulty = 'Foundational'
): Lesson {
  return getLessonByTopicAndDifficulty(topic, difficulty);
}

export function getFallbackNextCards(
  topic: Topic,
  _difficulty: Difficulty = 'Foundational',
  count: number = 2
): LessonCard[] {
  const capTopic = topic.trim().charAt(0).toUpperCase() + topic.trim().slice(1);
  const cards: LessonCard[] = [];
  const cardTypes = ['multiple_choice', 'build_the_system', 'choose_the_tradeoff', 'spot_the_mistake'];

  for (let i = 0; i < count; i++) {
    const id = `fallback-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const cardType = cardTypes[Math.floor(Math.random() * cardTypes.length)];

    if (cardType === 'multiple_choice') {
      cards.push({
        id,
        type: 'multiple_choice',
        question: `How does ${capTopic} optimize system performance under load?`,
        hint: `Consider how ${capTopic} reduces CPU and I/O bottlenecks.`,
        simpleExplanation: `${capTopic} spreads workload evenly so no single component gets overwhelmed.`,
        options: [
          {
            id: `${id}-opt1`,
            text: `Decouples components and reduces latency for ${capTopic}`,
            isCorrect: true,
            explanation: `Correct! Sound architecture in ${capTopic} prevents single-point bottlenecks.`
          },
          {
            id: `${id}-opt2`,
            text: `Eliminates network transmission latency completely`,
            isCorrect: false,
            explanation: `Physical network latency still applies.`
          }
        ]
      });
    } else if (cardType === 'spot_the_mistake') {
      cards.push({
        id,
        type: 'spot_the_mistake',
        instruction: `Tap the bottleneck component in this ${capTopic} flow:`,
        contextCodeOrDiagram: {
          type: 'diagram',
          content: `${capTopic} Flow -> Uncached Direct DB Read`,
          nodes: [
            { id: 'n1', label: 'API Gateway', isMistake: false, subtext: 'Rate limited' },
            { id: 'n2', label: 'Uncached DB Read', isMistake: true, subtext: 'Lock contention risk!' }
          ]
        },
        explanation: `Directly reading disk storage without an in-memory Redis cache causes heavy latency under traffic spikes.`
      });
    } else {
      cards.push({
        id,
        type: 'choose_the_tradeoff',
        scenario: `What is the primary architectural trade-off when scaling ${capTopic}?`,
        options: [
          {
            id: `${id}-t1`,
            title: `Horizontal Scaling & In-Memory Caching`,
            pros: ['Sub-millisecond read times', 'Scales across instances'],
            cons: ['Eventual consistency management'],
            isBestChoice: true,
            why: `Caching in RAM offers immense throughput wins for ${capTopic}.`
          },
          {
            id: `${id}-t2`,
            title: `Single Giant Server Instance`,
            pros: ['Simple setup'],
            cons: ['Single point of failure', 'Hard scaling limit'],
            isBestChoice: false,
            why: `Vertical scaling hits hardware boundaries quickly.`
          }
        ]
      });
    }
  }

  return cards;
}

