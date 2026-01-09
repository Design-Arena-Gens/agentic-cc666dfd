# Agentic AI Studio

Agentic AI Studio is a Next.js web application that gives you a conversational workspace for brainstorming, drafting, and iterating on ideas. It lets you connect your own OpenAI API key and chat with production-ready models through a rich, responsive interface that is ready to deploy on Vercel.

## Features

- Conversational canvas with multi-turn history and auto-scrolling.
- Quick-start prompt chips to bootstrap ideation sessions.
- Model selector wired for OpenAI's Responses API (configurable via environment variables).
- Dark, glassmorphic UI built with Tailwind CSS v4 and React 19.
- API route proxy that securely forwards chat requests to OpenAI on the server.

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root and add your OpenAI credentials:

```
OPENAI_API_KEY=sk-********************************
```

### 3. Run locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to interact with the studio.

### 4. Lint and build

```bash
npm run lint
npm run build
```

## Deployment

Deploy directly to Vercel once you have populated the environment variables:

```bash
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-cc666dfd
```

After deployment, verify the production URL (replace with your live domain if different):

```bash
curl https://agentic-cc666dfd.vercel.app
```

## Tech Stack

- Next.js 16 (App Router, React 19)
- Tailwind CSS v4
- TypeScript
- OpenAI Chat Completions API

Feel free to extend the workspace with streaming responses, vector search, or integrations with your product data.
