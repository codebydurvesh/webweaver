# Webweaver: https://webweaver-code.vercel.app/

> **For educational purposes only.** This is a personal learning project — a clone built to understand how AI-powered website builders (like [bolt.new](https://bolt.new)) work under the hood. It is **not** a product and is **not** intended for commercial use.

Check out the [Live URL](https://webweaver-code.vercel.app/).

Describe a website in plain English and watch it get built in front of you — file by file, with the code, a live preview, and a real terminal, all running in the browser.

![Next.js](https://img.shields.io/badge/Next.js-16-black) ![React](https://img.shields.io/badge/React-19-149eca) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)

## What it does

1. You type a prompt (e.g. _"A SaaS landing page with pricing tiers"_).
2. The backend classifies it as a **React** or **Node** project and loads the right starter template.
3. An LLM streams back an artifact describing the files to create and shell commands to run.
4. Those files are streamed into the UI as a step list, a file explorer, and a Monaco code editor.
5. The project is booted inside a **WebContainer** — npm install runs, the dev server starts, and a live preview appears, all entirely in your browser.
6. You can keep refining with follow-up prompts.

## Tech stack

| Concern            | Choice                                                        |
| ------------------ | ------------------------------------------------------------ |
| Framework          | [Next.js 16](https://nextjs.org) (App Router)                |
| UI                 | React 19, Tailwind CSS 4, [lucide-react](https://lucide.dev) icons |
| LLM                | [Groq](https://groq.com) SDK — `llama-3.3-70b-versatile`     |
| In-browser runtime | [StackBlitz WebContainers](https://webcontainers.io)        |
| Code editor        | [Monaco](https://github.com/microsoft/monaco-editor) (`@monaco-editor/react`) |
| Terminal           | [xterm.js](https://xtermjs.org)                              |

## WebContainers

This project uses [**StackBlitz WebContainers**](https://webcontainers.io) to run the generated Node/React projects directly in the browser — installing dependencies, starting the dev server, and serving a live preview without any backend execution.

WebContainers require cross-origin isolation, which is why [`next.config.ts`](next.config.ts) sets `Cross-Origin-Embedder-Policy` and `Cross-Origin-Opener-Policy` headers, and the container is booted with `coep: "credentialless"`.

WebContainers is a product of StackBlitz and is used here strictly for **learning and non-commercial demonstration**. All related trademarks and rights belong to StackBlitz. If you intend to use WebContainers in a production or commercial setting, please review the [official WebContainers licensing terms](https://webcontainers.io/enterprise).

## Getting started

### Prerequisites

- Node.js 18+
- A [Groq API key](https://console.groq.com/keys) (free)

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Add your Groq API key
echo "GROQ_API_KEY=your_key_here" > .env.local

# 3. Run the dev server
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

> **Note:** WebContainers run best in Chromium-based browsers (Chrome, Edge). The page must be cross-origin isolated, which the included Next.js config handles automatically.

## Project structure

```
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts        # Streams the LLM artifact response
│   │   └── template/route.ts    # Classifies prompt → react | node starter
│   ├── builder/page.tsx         # The build workspace (steps, editor, preview, terminal)
│   └── page.tsx                 # Landing page with the prompt box
├── components/                  # Editor, file explorer, preview, terminal, panels, EduBadge
├── hooks/
│   ├── useBuilder.ts            # Orchestrates template → stream → parse → files
│   └── useWebContainer.ts       # Boots the container, installs, runs the dev server
├── lib/
│   ├── webcontainer.ts          # WebContainer boot + file-tree helpers
│   ├── parseArtifact.ts         # Parses the streamed artifact into steps/files
│   ├── prompts.ts               # System + base prompts
│   └── defaults/                # React & Node starter templates
└── types/
```

## Disclaimer

This repository is a study/portfolio project shared for learning. It is provided **as-is**, with no warranty, and is **not affiliated with or endorsed by** bolt.new, StackBlitz, or Groq. Please don't use it commercially.
