import { idle, superFull } from "@/components/tamagotchiFrames";
import { PromptTemplate } from "langchain/prompts";
import { LLMChain } from "langchain/chains";
import MemoryManager from "./memory";
import StateManager from "./state";

export enum INTERACTION {
  BORN,
  FEED,
  PLAY,
  LIGHTS_OUT,
  BATH,
  GO_TO_HOSPITAL,
  DISCIPLINE,
  // TODO - add other types
}

export async function handleBath(stateManager: StateManager, userid: string) {
  console.debug("Bathing...");
  const currentStatus = (await stateManager.getLatestStatus(userid)).status;
  const lastInteractions = await stateManager.getLastInteractions(userid);

  await stateManager.saveInteraction(INTERACTION.BATH, {}, userid);
  const newStatus = {
    ...currentStatus,
    poop: currentStatus.poop === 0 ? 0 : currentStatus.poop - 1,
  };
  await stateManager.updateTamagotchiStatus(newStatus, userid);
}

export async function handleDiscipline(
  model: any,
  memoryManager: MemoryManager,
  stateManager: StateManager,
  userid: string
) {
  console.debug("Discipline :(");
  const currentStatus = (await stateManager.getLatestStatus(userid)).status;
  const lastInteractions = await stateManager.getLastInteractions(userid);
  const disciplinePrompt = PromptTemplate.fromTemplate(`
ONLY return JSON as output. no prose. ONLY JSON!!!

You are a virtual pet and your owner is disciplining you for being naughty. 

Your current status: {currentStatus}. 
Your previous interactions: {lastInteractions}

Return in JSON on what your thoughts are on the discipline, and if you think the discipline was effective and for good reason. Rate the it from 1-5, where 1 being the discipline was for no reason, and 5 being you understood the reasoning. Also return in emoji in how it makes you feel.

Example (for demonstration purpose):
{{"emoji": "😡", "rating": 1, "comment": "What was that for???!!"}}


Example (for demonstration purpose):
{{"emoji": "😖", "rating": 3, "comment": "Ok i will try not to poop everywhere."}}
`);

  const disciplineChain = new LLMChain({
    llm: model,
    prompt: disciplinePrompt,
  });

  const result = await disciplineChain
    .call({
      currentStatus: JSON.stringify(currentStatus),
      lastInteractions: JSON.stringify(lastInteractions),
    })
    .catch(console.error);
  const { text } = result!;
  const resultJsonMetadata = JSON.parse(text);

  const potential_comment = resultJsonMetadata.comment;

  await memoryManager.saveToMemory(
    potential_comment,
    resultJsonMetadata,
    userid
  );

  await stateManager.saveInteraction(
    INTERACTION.DISCIPLINE,
    resultJsonMetadata,
    userid
  );
  return resultJsonMetadata;
}

export async function handlPlay(
  model: any,
  memoryManager: MemoryManager,
  stateManager: StateManager,
  userid: string
) {
  console.debug("Playing!");
  const currentStatus = JSON.stringify(
    (await stateManager.getLatestStatus(userid)).status
  );
  const playPrompt = PromptTemplate.fromTemplate(`
ONLY return JSON as output. no prose. ONLY JSON!!!

You are a virtual pet and your owner wants to play with you.

Your current status: {currentStatus}. If you don't feel happy or healthy, you can refuse to interact. 

Return in JSON what you prefer to play, and your rating of the activity. Rate the activity from 1-5, where 1 being you hate the activity, and 5 being you loved it. 

Example (for demonstration purpose):
{{"activity": "playing basketball", "emoji": "🏀", "rating": 1, "comment": "I absolutely hate playing basketball."}}

If you don't want to play, set "refuse" to true:
Example (for demonstration purpose):
{{"refuse": true,  "activity": "playing basketball", "emoji": "🏀", "rating": 1, "comment": "Not in the mood. Bye."}}
`);

  const playChain = new LLMChain({
    llm: model,
    prompt: playPrompt,
  });

  const result = await playChain.call({ currentStatus }).catch(console.error);
  const { text } = result!;
  const resultJsonMetadata = JSON.parse(text);

  const potential_comment = resultJsonMetadata.comment;

  await memoryManager.saveToMemory(
    potential_comment,
    resultJsonMetadata,
    userid
  );

  await stateManager.saveInteraction(
    INTERACTION.PLAY,
    resultJsonMetadata,
    userid
  );
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
