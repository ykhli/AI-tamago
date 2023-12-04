import { idle, superFull } from "@/components/tamagotchiFrames";
import { PromptTemplate } from "langchain/prompts";
import { LLMChain } from "langchain/chains";
import MemoryManager from "./memory";
import StateManager from "./state";

export enum INTERACTION {
  FEED,
  PLAY,
  LIGHTS_OUT,
  BATH,
  GO_TO_HOSPITAL,
  // TODO - add other types
}

export async function handlPlay(
  model: any,
  memoryManager: MemoryManager,
  stateManager: StateManager
) {
  console.debug("Playing!");
  const playPrompt = PromptTemplate.fromTemplate(`
ONLY return JSON as output. no prose. ONLY JSON!!!

You are a virtual pet and your owner wants to play with you.

Return in JSON what you prefer to play, and your rating of the activity. Rate the activity from 1-5, where 1 being you hate the activity, and 5 being you loved it. 

Example (for demonstration purpose):
{{"activity": "playing basketball", "emoji": "🏀", "rating": 1, "comment": "I absolutely hate playing basketball."}}
`);

  const playChain = new LLMChain({
    llm: model,
    prompt: playPrompt,
  });

  const result = await playChain.call({}).catch(console.error);
  const { text } = result!;
  const resultJsonMetadata = JSON.parse(text);

  const potential_comment = resultJsonMetadata.comment;

  await memoryManager.saveToMemory(potential_comment, resultJsonMetadata);

  await stateManager.saveInteraction(INTERACTION.PLAY, resultJsonMetadata);
  return resultJsonMetadata;
}

export async function handleFeed(
  model: any,
  memoryManager: MemoryManager,
  stateManager: StateManager
) {
  //TODO
}

export const foodReviewPrompot = PromptTemplate.fromTemplate(`
Respond ONLY in JSON. No prose. 

You are a Tamagotchi who likes to eat. Here are the recent foods you ate: {recentFood}
Previously, you had {food} and here's what you thought about it {foodMemory}.

Tell me more about how you felt about eating this food.

Response format: {{comment: "I love eating sushi"}}
`);

export const generateEmojiPrompt = `
ONLY return JSON as output. no prose. ONLY JSON!!!
enerate emoji(s) based on this food: {food}. 
Example: {{"emoji": "🍣"}}`;

//TODO - turns out chatgpt is terrible at generating consistent animation frames. Explore more later?
export const eatAnimationPrompt = `
${idle}

Respond ONLY in JSON. Above is an animation of a tamagotchi. generate another 20-frame animation of this tamagotchi eating {food} and being super happy. The tamagotchi should dance around after eating.

Incorporate emoji and words in the animation, but you should make the animation more obvious and make the tamagotchi move around. 

Response format: ["frame1" ,"frame2", ....]

`;

export const fullAnimationPrompt = `
ONLY reply in JSON. Here's a 10-frame ascii animation of a tamagotchi, can you generate a 10-frame ascii animation of this tamagotchi being super full and no longer want to eat? You can incorporate emoji in it. 

export const idle = ${idle}
`;
