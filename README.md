```
my-nextjs-app/
├── 📁 public/                 # Static assets (images, fonts, icons) accessible at root
├── 📁 src/                    # Main source code directory
│   ├── 📁 app/                # App Router: file-system based routing & pages
│   │   ├── 📁 (auth)          # Route group (doesn't affect URL) for grouping login/signup
│   │   │   ├── login/
│   │   │   │   └── page.tsx   # Renders at /login
│   │   │   └── signup/
│   │   │       └── page.tsx   # Renders at /signup
│   │   ├── 📁 dashboard/      # Protected dashboard route segment
│   │   │   ├── 📁 _components/# Private folder for components used *only* inside dashboard
│   │   │   ├── error.tsx      # Error boundary for dashboard
│   │   │   ├── loading.tsx    # Loading skeleton/UI for dashboard
│   │   │   └── page.tsx       # Renders at /dashboard
│   │   ├── favicon.ico        # App favicon
│   │   ├── layout.tsx         # Root layout wrapping all pages
│   │   └── page.tsx           # Homepage (renders at /)
│   │
│   ├── 📁 components/         # Reusable global UI components (buttons, modals, inputs)
│   │   └── ui/
│   │
│   ├── 📁 hooks/              # Custom React hooks (e.g., useAuth, useDebounce)
│   │
│   ├── 📁 lib/                # Third-party library initializations & clients (e.g., supabase.ts)
│   │
│   ├── 📁 services/           # API integration or data fetching abstraction modules
│   │
│   ├── 📁 utils/              # Helper functions, formatters, and small utility scripts
│   │
│   └── 📁 types/              # TypeScript interfaces and global type definitions
│
├── .env.local                 # Local environment variables (Supabase keys, etc.)
├── next.config.js             # Next.js configuration settings
├── package.json               # Project dependencies and scripts
└── tailwind.config.js         # Tailwind CSS configuration
```

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
