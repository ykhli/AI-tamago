import { idle, superFull } from "@/components/tamagotchiFrames";
import { PromptTemplate } from "langchain/prompts";

export enum INTERACTION {
  FEED,
  PLAY,
  LIGHTS_OUT,
  BATH,
  // TODO - add other types
}

export function feedTamagotchi() {}

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
