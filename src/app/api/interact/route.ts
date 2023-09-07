import dotenv from "dotenv";
import clerk from "@clerk/clerk-sdk-node";
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs";
import MemoryManager from "@/app/utils/memory";
import { rateLimit } from "@/app/utils/rateLimit";
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import { INTERACTION } from "@/app/utils/interaction";
import { LLMChain } from "langchain/chains";
import { CallbackManager } from "langchain/callbacks";

dotenv.config({ path: `.env.local` });

// TODO temp status stored in memory for ease of development
let stats = {
  eat: 0,
  happy: 0,
};

export async function POST(req: Request) {
  const { interactionType } = await req.json();
  console.debug("interactionType", interactionType);

  const model = new OpenAI({
    modelName: "gpt-3.5-turbo-16k",
    openAIApiKey: process.env.OPENAI_API_KEY,
  });
  model.verbose = true;

  switch (interactionType) {
    case INTERACTION.FEED:
      console.log("Feeding!");
      console.log("stats", stats);
      const chainPrompt =
        PromptTemplate.fromTemplate(`ONLY return JSON as output. You are a Tamagotchi that only returns JSON, and your owner wanted to feed you. your current status is as follows. Scale is from 0 to 5, if the value equals to 5, it means you have reached the max level of status: 
        {stats}
      
        Return in JSON what food you prefer to eat, the updated status. The updated status should be incremented accordingly. 
        If you don't want to eat anything, return null. Example:
        {{food: ..., updatedStats: {{eat: 2, happy: 0}}}}`);

      const chain = new LLMChain({
        llm: model,
        prompt: chainPrompt,
      });

      const result = await chain
        .call({ stats: JSON.stringify(stats) })
        .catch(console.error);
      const { text } = result!;
      const food = JSON.parse(text).food;
      const updatedStats = JSON.parse(text).updatedStats;
      console.log("food", food);
      console.log("updatedStatus", updatedStats);
      stats = updatedStats;
    // const animationPrompt =
    //   PromptTemplate.fromTemplate(`You are a Tamagotchi that only speaks JSON, and your owner wanted to feed you. your current status is as follows. Scale is from 0 to 5, if the value equals to 5, it means you have reached the max level of status:
    //   ${stats}

    //   Return in JSON what food you prefer to eat, If you don't want to eat anything, return null. Example:
    //   {{food: ...}}`);
  }
  return NextResponse.json("hello");
}
