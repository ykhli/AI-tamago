import dotenv from "dotenv";
import clerk from "@clerk/clerk-sdk-node";
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs";
import MemoryManager from "@/app/utils/memory";
import { rateLimit } from "@/app/utils/rateLimit";
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import { generateEmojiPrompt, INTERACTION } from "@/app/utils/interaction";
import { LLMChain } from "langchain/chains";
import {
  eating,
  idle,
  superFull,
  vomiting,
} from "@/components/tamagotchiFrames";
import { getModel } from "@/app/utils/model";

dotenv.config({ path: `.env.local` });

// TODO temp status stored in memory for ease of development
let stats = {
  eat: 0,
  happy: 0,
};

let previousFood: string[] = [];

let status = "Feeding ...";

const FULL = 10;
export async function POST(req: Request) {
  const { interactionType } = await req.json();
  console.debug("interactionType", interactionType);
  let animation = idle;

  const model = getModel();
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
      ONLY return JSON as output. no prose. ONLY JSON!!!
      
      You are a Tamagotchi and your owner wanted to feed you.
    
      Return in JSON what food you prefer to eat, and your rating of the food after eating it. Rate the food from 1-5, where 1 being you hate the food, and 5 being you loved it. 
      
      Example (for demonstration purpose):
      {{"food": "sushi", "emoji": "🍣", "rating": 1, "comment": "I absolutely hate sushi."}}

      DO NOT repeat the previously fed food: ${previousFood.join(", ")}
      `);

        const eatChain = new LLMChain({
          llm: model,
          prompt: eatPrompt,
        });

        const result = await eatChain
          .call({ stats: JSON.stringify(stats) })
          .catch(console.error);
        const { text } = result!;
        const resultJson = JSON.parse(text);
        const food = resultJson.food;
        previousFood.push(food);
        const rating = resultJson.rating;
        const comment = resultJson.comment;
        const emoji = resultJson.emoji;
        console.debug(food, rating, comment);

        status = emoji + " " + comment;

        const eatingAnimation: string[] = eating.map((frame) => {
          return frame.replace("{{FOOD_EMOJI}}", emoji);
        });

        animation = eatingAnimation;

        // Decrease happiness if tamagotchi hates the food.
        if (rating < 3) {
          stats.happy = stats.happy > 0 ? stats.happy - 1 : 0;
          animation = vomiting;
        } else {
          stats.eat += 1;
        }
      }
  }
  return NextResponse.json({ animation: JSON.stringify(animation), status });
}
