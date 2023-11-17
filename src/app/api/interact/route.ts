import dotenv from "dotenv";
import clerk from "@clerk/clerk-sdk-node";
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs";
import { rateLimit } from "@/app/utils/rateLimit";
import { OpenAI } from "langchain/llms/openai";
import MemoryManager from "@/app/utils/memory";
import { PromptTemplate } from "langchain/prompts";
import {
  foodReviewPrompot,
  generateEmojiPrompt,
  INTERACTION,
} from "@/app/utils/interaction";
import { LLMChain } from "langchain/chains";
import {
  eating,
  idle,
  superFull,
  vomiting,
} from "@/components/tamagotchiFrames";
import { getModel } from "@/app/utils/model";
import { metadata } from "@/app/layout";

dotenv.config({ path: `.env.local` });

// TODO temp status stored in memory for ease of development
let stats = {
  eat: 0,
  happy: 0,
};

let status = "Feeding ...";

const FULL = 10;
const recentFood: string[] = [];

export async function POST(req: Request) {
  const { interactionType } = await req.json();
  console.debug("interactionType", interactionType);
  let animation = idle;

  const model = getModel();
  model.verbose = true;
  const memoryManager = await MemoryManager.getInstance();

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

      DO NOT repeat the previously fed food: ${recentFood.join(", ")}
      `);

        const eatChain = new LLMChain({
          llm: model,
          prompt: eatPrompt,
        });

        const result = await eatChain
          .call({ stats: JSON.stringify(stats) })
          .catch(console.error);
        const { text } = result!;
        const resultJsonMetadata = JSON.parse(text);

        const food = resultJsonMetadata.food;
        updateRecentFood(recentFood, food);

        const rating = resultJsonMetadata.rating;
        const potential_comment = resultJsonMetadata.comment;
        const emoji = resultJsonMetadata.emoji;

        // TODO - this is for testing
        const foodMemory = await memoryManager.vectorSearch(food);
        console.log("foodMemory", foodMemory.metadata.comment);

        // const foodMemoryChain = new LLMChain({
        //   llm: model,
        //   prompt: foodReviewPrompot,
        // });

        // const foodMemoryResult = await foodMemoryChain.call({
        //   recentFood,
        //   food,
        //   foodMemory.metadata.comment,
        // });

        await memoryManager.saveToMemory(potential_comment, resultJsonMetadata);

        status = emoji + " " + potential_comment;

        const eatingAnimation: string[] = eating.map((frame) => {
          return frame.replace("{{FOOD_EMOJI}}", emoji);
        });

        animation = eatingAnimation;

        // TODO - this should probably be deleted later. LLM should decide once in a while
        // Decrease happiness if tamagotchi hates the food.
        if (rating < 3) {
          stats.happy = stats.happy > 0 ? stats.happy - 1 : 0;
          animation = vomiting;
        } else {
          stats.eat += 1;
        }

        await memoryManager.saveInteraction(
          INTERACTION.FEED,
          resultJsonMetadata
        );
      }
  }
  return NextResponse.json({ animation: JSON.stringify(animation), status });
}

function updateRecentFood(recent: any, food: string) {
  if (recent.length > 5) {
    recent = recent.shift();
  }
  recent.push(food);
}
