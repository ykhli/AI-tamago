import dotenv from "dotenv";
import clerk from "@clerk/clerk-sdk-node";
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs";
import MemoryManager from "@/app/utils/memory";
import { rateLimit } from "@/app/utils/rateLimit";
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import {
  eatAnimationPrompt,
  generateEmojiPrompt,
  INTERACTION,
} from "@/app/utils/interaction";
import { LLMChain } from "langchain/chains";
import { eating, idle, superFull } from "@/components/tamagotchiFrames";

dotenv.config({ path: `.env.local` });

// TODO temp status stored in memory for ease of development
let stats = {
  eat: 4,
  happy: 0,
};

let status = "Feeding ...";

const FULL = 5;
export async function POST(req: Request) {
  const { interactionType } = await req.json();
  console.debug("interactionType", interactionType);
  let animation = idle;

  const model = new OpenAI({
    modelName: "gpt-3.5-turbo-16k",
    openAIApiKey: process.env.OPENAI_API_KEY,
  });
  model.verbose = true;

  switch (interactionType) {
    case INTERACTION.FEED:
      if (stats.eat === FULL) {
        console.debug("Full!");
        animation = superFull;
        status = "Tamagotchi is full!!";
      } else {
        console.debug("Feeding!");
        console.debug("stats", stats);
        const eatPrompt = PromptTemplate.fromTemplate(`
      ONLY return JSON as output. You are a Tamagotchi that only returns JSON, and your owner wanted to feed you.
    
      Return in JSON what food you prefer to eat, and your rating of the food after eating it. Rate the food from 1-5, where 1 being you hate the food, and 5 being you loved it. 
      
      Example (for demonstration purpose):
      {{food: sushi, rating: 1}}
      `);

        const eatChain = new LLMChain({
          llm: model,
          prompt: eatPrompt,
        });

        const result = await eatChain
          .call({ stats: JSON.stringify(stats) })
          .catch(console.error);
        const { text } = result!;
        const food = JSON.parse(text).food;
        const rating = JSON.parse(text).rating;
        console.debug(food, rating);

        // generate animations
        const emojiPrompt = PromptTemplate.fromTemplate(generateEmojiPrompt);
        const emojiChain = new LLMChain({
          llm: model,
          prompt: emojiPrompt,
        });
        const emojiResult = await emojiChain.call({ food });
        const emoji = emojiResult!.text;
        status += emoji;

        const eatingAnimation: string[] = eating.map((frame) => {
          return frame.replace("{{FOOD_EMOJI}}", emoji);
        });

        animation = eatingAnimation;
        stats.eat += 1;
      }
  }
  return NextResponse.json({ animation: JSON.stringify(animation), status });
}
