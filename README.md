# AI Tamago 🥚🐣
An 100% local, LLM-generated and LLM-driven virtual pet with thoughts, feelings and feedback. Revive your fond memories of Tamagotchi! 

All ascii animations are generated using chatgpt (included prompts in the repo). 

Have questions? Join [AI Stack devs](https://discord.gg/TsWCNVvRP5) and find me in #ai-tamago channel.

**Demo** 🪄

https://github.com/ykhli/AI-tamago/assets/3489963/8d7cb2ac-537a-45d4-98a5-1802b773e364



## Stack

- 🦙 Inference: [Ollama](https://github.com/jmorganca/ollama), with options to use OpenAI or [Replicate](https://replicate.com/)
- 🔔 Game state: [Inngest](https://www.inngest.com/)
- 💻 Transactional & vector database: [Supabase pgvector](https://supabase.com/docs/guides/database/extensions/pgvector)
- 🧠 LLM Orchestration: [Langchain.js](https://js.langchain.com/docs/)
- 🖼️ App logic: [Next.js](https://nextjs.org/)
- 🧮 Embeddings generation: [Transformer.js](https://github.com/xenova/transformers.js) and [
all-MiniLM-L6-v2](https://huggingface.co/Xenova/all-MiniLM-L6-v2)
- 🖌️ UI: [Vercel v0](https://v0.dev/)

## Prerequisites

- [Install Docker](https://www.docker.com/get-started)

## Quickstart

### 1. Fork and Clone repo

Fork the repo to your Github account, then run the following command to clone the repo:

```
git clone git@github.com:[YOUR_GITHUB_ACCOUNT_NAME]/AI-tamago.git
```

### 2. Install dependencies
```
cd ai-tamago
npm run dev
```

All client side tamagotchi code is in Tamagotchi.tsx

### 3. Install Ollama
Instructions are [here](https://github.com/jmorganca/ollama#macos).

### 4. Run Supabase locally
1. Install Supabase CLI

```
brew install supabase/tap/supabase
```

2. Start Supabase

Make sure you are under `/ai-tamago` directory and run:

```
supabase start
```

Tips: To run migrations or reset database -- seed.sql and migrations will run
`supabase db reset`

### 5. Fill in secrets
Note: The secrets here are for your **local** supabase instance

```
cp .env.local.example .env.local
```

Then get `SUPABASE_PRIVATE_KEY` by running

```
supabase status
```

Copy `service_role key` and save it as `SUPABASE_PRIVATE_KEY` in `.env.local`

### 6. Set up Inngest
`npx inngest-cli@latest dev`

Make sure your app is up and running -- Inngest functions (which are used to drive game state) should register automatically. 


### 7. Run app locally

Now you are ready to test out the app locally! To do this, simply run `npm run dev` under the project root and visit `http://localhost:3000`.

## Deployment Guide

Now you have played with the AI tamago locally -- it's time to deploy it somewhere more permanent so you can access it anytime! 

While I'm still writing up a detailed deployment guide, here are the resources you can refer to for deploying different parts of the app:  

- [Adding auth with Clerk](https://clerk.com/docs/quickstarts/nextjs) - takes < 5mins
- [Inngest deployment guide](https://www.inngest.com/docs/deploy)https://www.inngest.com/docs/deploy
- [Running Ollama on Fly.io](https://fly.io/blog/scaling-llm-ollama/)https://fly.io/blog/scaling-llm-ollama/
- [Run a next.js app on Fly.io](https://fly.io/docs/js/frameworks/nextjs/#:~:text=Deploy%20an%20existing%20NextJS%20app&text=First%2C%20install%20flyctl%2C%20your%20Fly,the%20root%20of%20your%20application.&text=Creating%20app%20in%20%2FUsers%2Fme,source%20code%20Detected%20a%20Next.)

