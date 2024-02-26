# AI Tamago 🥚🐣
A 100% local, LLM-generated and driven virtual pet with thoughts, feelings and feedback. Revive your fond memories of Tamagotchi! https://ai-tamago.fly.dev/

All ascii animations are generated using chatgpt (included prompts in the repo). 

Have questions? Join [AI Stack devs](https://discord.gg/TsWCNVvRP5) and find me in #ai-tamago channel.

**Demo** 🪄

https://github.com/ykhli/AI-tamago/assets/3489963/8d7cb2ac-537a-45d4-98a5-1802b773e364

## Stack

### Local Mode
- 🦙 Inference: [Ollama](https://github.com/jmorganca/ollama), with options to use OpenAI or [Replicate](https://replicate.com/)
- 🔔 Game state: [Inngest](https://www.inngest.com/)
- 💻 Transactional & vector database: [Supabase pgvector](https://supabase.com/docs/guides/database/extensions/pgvector)
- 🧠 LLM Orchestration: [Langchain.js](https://js.langchain.com/docs/)
- 🖼️ App logic: [Next.js](https://nextjs.org/)
- 🧮 Embeddings generation: [Transformer.js](https://github.com/xenova/transformers.js) and [
all-MiniLM-L6-v2](https://huggingface.co/Xenova/all-MiniLM-L6-v2)
- 🖌️ UI: [Magic Patterns](https://www.magicpatterns.com/) and [Vercel v0](https://v0.dev/) 

### Prod Mode
All of above, plus: 
- 🔐 Auth & User Management: [Clerk](https://clerk.com/)
- ☁️  Hosting: [Fly](https://fly.io/)
- 🥇 Rate Limiting: [Upstash](https://upstash.com/)

## Overview
- 🚀 [Quickstart](#quickstart)
- 💻 [Deployment Guide](#deployment-guide)

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
npm install
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

**0. Choose which model you want to use in production**
- If you want to test out using Chatgpt in prod, simply remove `LLM_MODEL=ollama` from `.env.local` and fill in `OPENAI_API_KEY`
- If you want to try [Replicate](https://replicate.com/), set `LLM_MODEL=replicate_llama` and fill in `REPLICATE_API_TOKEN`
- If you want to deploy Ollama yourself, you can follow this awesome guide -- [Scaling Large Language Models to zero with Ollama](https://fly.io/blog/scaling-llm-ollama/). It is possible to run Ollama on a `performance-4x` Fly VM (CPU) with `100gb` volume, but if you can get access to GPUs they are much faster. Join Fly's GPU waitlist [here](https://fly.io/gpu) if you don't yet have access!


**1. Switch to `deploy` branch -- this branch includes everything you need to deploy an app like [this](https://ai-tamago.fly.dev/).**

   
```git co deploy```


This branch contains a multi-tenancy-ready (thanks to Clerk) app, which means every user can get their own AI-tamago, and has token limit built in -- you can set how many times a user can send requests in the app (see `ratelimit.ts`)

**2. Move to Supabase Cloud:**

- Create a Supabase project [here](https://supabase.com/), then go to Project Settings -> API. Fill out secrets in `.env.local`
- `SUPABASE_URL` is the URL value under "Project URL"
- `SUPABASE_PRIVATE_KEY` is the key starts with `ey` under Project API Keys
- Copy Supabase project id, which you can find from the url https://supabase.com/dashboard/project/[project-id]

From your Ai-tamago project root, run:

```
supabase link --project-ref [insert project-id]
supabase migration up
supabase db reset --linked
```

**3. Create Upstash Redis instance for rate limiting**

This will make sure no one user calls any API too many times and taking up all the inference workloads. We are using Upstash's [awesome rate limiting SDK](https://upstash.com/blog/upstash-ratelimit) here.

- Sign in to [Upstash](https://upstash.com/)
- Under "Redis" on the top nav, click on "Create Database"
- Give it a name, and then select regions and other options based on your preference. Click on "Create"
- Scroll down to "REST API" section and click on ".env". Now you can copy paste both environment variables (`UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`) to your .env.local

**4. Now you are ready to deploy everything on Fly.io!**
- Register an account on fly.io and then [install flyctl](https://fly.io/docs/hands-on/install-flyctl/)
- Run `fly launch` under project root. This will generate a `fly.toml` that includes all the configurations you will need
- Run `fly scale memory 512` to scale up the fly vm memory for this app.
- Run `fly deploy --ha=false` to deploy the app. The --ha flag makes sure fly only spins up one instance, which is included in the free plan.
- For any other non-localhost environment, the existing Clerk development instance should continue to work. You can upload the secrets to Fly by running `cat .env.local | fly secrets import`
- If you want to make this a real product, you should create a prod environment under the [current Clerk instance](https://dashboard.clerk.com/). For more details on deploying a production app with Clerk, check out their documentation [here](https://clerk.com/docs/deployments/overview). **Note that you will likely need to manage your own domain and do domain verification as part of the process.**
- Create a new file `.env.prod` locally and fill in all the production-environment secrets. Remember to update `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` by copying secrets from Clerk's production instance -`cat .env.prod | fly secrets import` to upload secrets.

If you have questions, join [AI Stack devs](https://discord.gg/TsWCNVvRP5) and find me in #ai-tamago channel.

## Other Resources 
- [Adding auth with Clerk](https://clerk.com/docs/quickstarts/nextjs) - takes < 5mins
- [Inngest deployment guide](https://www.inngest.com/docs/deploy)https://www.inngest.com/docs/deploy
- [Running Ollama on Fly.io](https://fly.io/blog/scaling-llm-ollama/)https://fly.io/blog/scaling-llm-ollama/
- [Run a next.js app on Fly.io](https://fly.io/docs/js/frameworks/nextjs/#:~:text=Deploy%20an%20existing%20NextJS%20app&text=First%2C%20install%20flyctl%2C%20your%20Fly,the%20root%20of%20your%20application.&text=Creating%20app%20in%20%2FUsers%2Fme,source%20code%20Detected%20a%20Next.)

