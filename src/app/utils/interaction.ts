import { idle } from "@/components/tamagotchiFrames";

export enum INTERACTION {
  FEED,
  PLAY,
  LIGHTS_OUT,
  BATH,
  // TODO - add other types
}

export const generateEmojiPrompt = `Return one or more emojis and nothing else. Generate emoji(s) based on this food: {food}`;

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
