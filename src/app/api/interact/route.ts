import dotenv from "dotenv";
import { NextResponse } from "next/server";
import MemoryManager from "@/app/utils/memory";
import { PromptTemplate } from "langchain/prompts";
import {
  handleBath,
  handleDiscipline,
  handlPlay,
  INTERACTION,
} from "@/app/utils/interaction";
import { LLMChain } from "langchain/chains";
import {
  bath,
  discipline,
  eating,
  idle,
  playing,
  sick,
  superFull,
  vomiting,
} from "@/components/tamagotchiFrames";
import { getModel } from "@/app/utils/model";
import StateManager from "@/app/utils/state";

dotenv.config({ path: `.env.local` });
let status = "";
const recentFood: string[] = [];

export async function POST(req: Request) {
  const { interactionType } = await req.json();
  console.debug("interactionType", interactionType);
  let animation = idle;

  const model = getModel();
  model.verbose = true;
  const memoryManager = await MemoryManager.getInstance();
  const stateManager = await StateManager.getInstance();
  const tamagoStatus = (await stateManager.getLatestStatus()).status;
  console.log("tamagotchiStatus", tamagoStatus);

  switch (interactionType) {
    case INTERACTION.FEED:
      if (tamagoStatus.hunger == 10) {
        console.debug("Full!");
        animation = superFull;
        status = "Tamagotchi is full!!";
      } else {
        console.debug("Feeding!");
        const eatPrompt = PromptTemplate.fromTemplate(`
      ONLY return JSON as output. no prose. ONLY JSON!!!
      
      You are a virtual pet and your owner wanted to feed you.

      Your current status: {currentStatus}. If you don't feel happy or healthy, you can refuse to interact. 
    
      Return in JSON what food you prefer to eat, and your rating of the food after eating it. Rate the food from 1-5, where 1 being you hate the food, and 5 being you loved it. 
      
      Example (for demonstration purpose):
      {{"refuse": false, "food": "sushi", "emoji": "🍣", "rating": 5, "comment": "I absolutely love sushi."}}

      If you don't want to eat, set "refuse" to true:
      Example (for demonstration purpose):
      {{"refuse": true,  "food": "sushi", "emoji": "🍣","rating": 5,  "comment": "I'm not in the mood to eat."}}


      DO NOT repeat the previously fed food: ${recentFood.join(", ")}
      `);

        const eatChain = new LLMChain({
          llm: model,
          prompt: eatPrompt,
        });

        const result = await eatChain
          .call({ currentStatus: JSON.stringify(tamagoStatus) })
          .catch(console.error);
        const { text } = result!;
        const resultJsonMetadata = JSON.parse(text);

        const food = resultJsonMetadata.food;
        const refuseToEat = resultJsonMetadata.refuse
          ? resultJsonMetadata.refuse
          : false;
        updateRecentFood(recentFood, food);

        const potential_comment = resultJsonMetadata.comment;
        const emoji = resultJsonMetadata.emoji;

        // TODO - this is for testing
        // const foodMemory = await memoryManager.vectorSearch(food);
        // console.log("foodMemory", foodMemory.metadata.comment);

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

        const eatingAnimation: string[] = refuseToEat
          ? vomiting
          : eating.map((frame) => {
            return frame.replace("{{FOOD_EMOJI}}", emoji);
          });

        animation = eatingAnimation;
        await stateManager.saveInteraction(
          INTERACTION.FEED,
          resultJsonMetadata
        );
      }
      break;

    case INTERACTION.BATH:
      status = "Bathing";
      await handleBath(stateManager);

      animation = bath;

      break;
    case INTERACTION.DISCIPLINE:
      status = "Disciplining";
      let disciplineResult = await handleDiscipline(
        model,
        memoryManager,
        stateManager
      );

      console.log("disciplineResult emoji", disciplineResult.emoji);
      const disciplineEmoij = disciplineResult.emoji
        ? disciplineResult.emoji
        : "😑";
      status = disciplineEmoij + " " + disciplineResult.comment;

      const disciplineAnimation: string[] = discipline.map((frame) => {
        return frame.replace("{{DISCIPLINE_EMOJI}}", disciplineEmoij);
      });

      animation = disciplineAnimation;

      break;
    case INTERACTION.PLAY:
      let resultJsonMetadata = await handlPlay(
        model,
        memoryManager,
        stateManager
      );

      const emoji = resultJsonMetadata.emoji ? resultJsonMetadata.emoji : "🛝";
      status = emoji + " " + resultJsonMetadata.comment;

      const playAnimation: string[] = playing.map((frame) => {
        return frame.replace("{{PLAY_EMOJI}}", emoji);
      });

      animation = playAnimation;

      break;
    case INTERACTION.GO_TO_HOSPITAL:
      console.debug("Hospital!");
      status = "Going to hospital";
      await stateManager.saveInteraction(INTERACTION.GO_TO_HOSPITAL, {});

      animation = sick;
      break;
  }
  return NextResponse.json({ animation: JSON.stringify(animation), status });
}

function updateRecentFood(recent: any, food: string) {
  if (recent.length > 5) {
    recent = recent.shift();
  }
  recent.push(food);
}
