quantum-observer/
├── public/                     # Static assets (images, icons, etc.)
│   ├── favicon.ico
│   ├── logo.png
│   └── screenshots/
│
├── src/
│   ├── app/                    # Next.js App Router (pages & layouts)
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Landing/Dashboard entry page
│   │   ├── dashboard/          # Dashboard routes
│   │   │   └── page.tsx
│   │   └── api/                # API routes (server actions)
│   │       ├── jobs/
│   │       │   └── route.ts
│   │       └── backends/
│   │           └── route.ts
│   │
│   ├── components/             # Reusable React components
│   │   ├── dashboard/          # Dashboard-specific components
│   │   │   ├── JobTable.tsx
│   │   │   ├── BackendHealth.tsx
│   │   │   └── JobDetails.tsx
│   │   ├── charts/             # Recharts components
│   │   │   └── StatusHistoryChart.tsx
│   │   ├── layout/             # Layout components
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Navbar.tsx
│   │   │   └── ThemeToggle.tsx
│   │   └── ui/                 # ShadCN UI components
│   │
│   ├── ai/                     # Genkit AI logic
│   │   ├── flows/              # AI pipelines (anomaly detection, etc.)
│   │   │   └── anomalyDetection.ts
│   │   └── index.ts            # AI initialization/config
│   │
│   ├── data/                   # Mock/demo data (for development)
│   │   └── sampleJobs.json
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── useToast.ts
│   │   ├── useJobs.ts
│   │   └── useBackendStatus.ts
│   │
│   ├── lib/                    # Utility functions & types
│   │   ├── utils.ts            # Helper functions
│   │   ├── api.ts              # API fetch helpers
│   │   └── types.ts            # TypeScript type definitions
│   │
│   ├── providers/              # React Context Providers
│   │   └── ThemeProvider.tsx
│   │
│   └── styles/                 # Global styles
│       └── globals.css
│
├── .env.local                  # Environment variables (ignored by git)
├── next.config.js              # Next.js configuration
├── postcss.config.js           # PostCSS config (for Tailwind)
├── tailwind.config.js          # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
├── package.json
└── README.md

Why this structure?

* app/ → clean App Router separation for pages, layouts, and API routes.

* components/ → divided by domain (dashboard/, charts/, layout/, ui/) to avoid a messy "components dump".

* ai/ → keeps all Genkit flows and AI logic together.

* hooks/ → reusable state & data fetching hooks.

* lib/ → utilities and types for consistency across app.

* providers/ → centralized React context providers (themes, auth, etc.).

* data/ → mock/demo data for dev mode.

* styles/ → Tailwind global overrides and CSS.