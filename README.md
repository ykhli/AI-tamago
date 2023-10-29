# TamagoGPT 🥚

<img width="356" alt="Screenshot 2023-09-07 at 4 47 58 AM" src="https://github.com/ykhli/tamagotchiGPT/assets/3489963/7fb5aab2-98b1-4efd-a2a7-7914e06cdaf8">

## Getting Started

`npm install`
`npm run dev`

All client side tamagotchi code is in Tamagotchi.tsx

## Local Setup

`brew install supabase/tap/supabase`
`supabase start`

To serve embedding generation function:
`supabase functions serve`

Example request to get embeddings
`curl --request POST 'http://localhost:54321/functions/v1/embed' \
  --header 'Authorization: Bearer ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{ "input": "HELLO WORLD!!!" }'
`

To run migrations or reset database -- seed.sql and migrations will run
`supabase db reset`
