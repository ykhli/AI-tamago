# AI Tamago 🥚🐣
An 100% local, LLM-generated and LLM-driven virtual pet with thoughts, feelings and feedback. Revive your fond memories of Tamagotchi! 

All ascii animations are generated using chatgpt (included prompts in the repo). 

<img width="833" alt="Screen Shot 2023-12-05 at 9 44 26 PM" src="https://github.com/ykhli/AI-tamago/assets/3489963/8075ddb4-a859-4b1c-af29-8afad866c7da">

## Stack

- 🦙 Inference: [Ollama](https://github.com/jmorganca/ollama)
- 🔔 Game state: [Inngest](https://www.inngest.com/)
- 💻 Transactional & vector database: [Supabase pgvector](https://supabase.com/docs/guides/database/extensions/pgvector)
- 🧠 LLM Orchestration: [Langchain.js](https://js.langchain.com/docs/)
- 🖼️ App logic: [Next.js](https://nextjs.org/)
- 🧮 Embeddings generation: [Transformer.js](https://github.com/xenova/transformers.js) and [
all-MiniLM-L6-v2](https://huggingface.co/Xenova/all-MiniLM-L6-v2)
- 🖌️ UI: [Vercel v0](https://v0.dev/)


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

