import { SupabaseClient, createClient } from "@supabase/supabase-js";
import { INTERACTION } from "./interaction";
import { pipeline } from "@xenova/transformers";
import { PromptTemplate } from "langchain/prompts";
import { getModel } from "./model";
import { LLMChain } from "langchain/chains";
import { data } from "autoprefixer";

const embedding_endpoint = process.env.SUPABASE_EMBEDDING_ENDPOINT!;

class StateManager {
  private static instance: StateManager;

  private dbClient: SupabaseClient;
  private model: any;

  public constructor() {
    const auth = {
      detectSessionInUrl: false,
      persistSession: false,
      autoRefreshToken: false,
    };
    const url = process.env.SUPABASE_URL!;
    const privateKey = process.env.SUPABASE_PRIVATE_KEY!;
    this.dbClient = createClient(url, privateKey, { auth });
    this.model = getModel();
    this.model.verbose = true;
  }

  public async init() {}

  public async update() {
    console.log("supabase url", process.env.SUPABASE_URL);
    const status = (
      await this.dbClient
        .from("tamagotchi_status")
        .select()
        .order("updatedat", { ascending: false })
        .limit(1)
    ).data!;
    console.log("status", status);
    const age = status![0].age ? status![0].age + 1 : 1; // 1 tick older!
    const lastInteractions = (
      await this.dbClient
        .from("tamagotchi_interactions")
        .select()
        .order("ts", { ascending: true })
        .limit(10)
    ).data!;
    const timeNow = new Date().getTime();

    const prompt = PromptTemplate.fromTemplate(`
      ONLY return JSON as output. no prose. 
      
      You are a virtual pet, and here's the last 10 interactions you had and their timestamps:
      {lastInteractions}

      If there is no interaction above, it means you haven't had interactions with your owner for a while. Your happiness, health and hunger level will be affected accordingly. 

      Your previous status: 
      {status}

      You get hungry if you haven't had food you liked. You get unhappy if you haven't been played within the last hour. 
      You get unhealthy if you ate too much, ate something you hate, or simply caught cold from visiting friends. 
      
      The time now is ${new Date().toISOString()}.
      Return your current status in JSON based on your interaction data above. Include a comment explaining why you feel this way.

     
      Example (for demonstration purpose) - Max value for each field is 10, min value for each field is 0.
      {{ "hunger": 0, "happiness": 0, "health": 0, "comment": "(add a comment based on context)"}}

      `);
    console.log("lastInteractions", lastInteractions);
    const lastInteractionsString = lastInteractions
      .map((interaction) => {
        return `Interaction: ${
          INTERACTION[interaction.interaction]
        }, ${JSON.stringify(interaction.metadata)},  at ${interaction.ts}`;
      })
      .join("\n ");

    const stateChain = new LLMChain({
      llm: this.model,
      prompt: prompt,
    });

    const previousStatus = status![0].status;
    const result = await stateChain
      .call({
        lastInteractions: lastInteractionsString,
        status: JSON.stringify({
          health: previousStatus.health,
          happiness: previousStatus.happiness,
          hunger: previousStatus.hunger,
        }),
      })
      .catch(console.error);

    const { text } = result!;
    const resultJsonMetadata = JSON.parse(text);
    // TODO - validate or retry here

    const { error } = await this.dbClient
      .from("tamagotchi_status")
      .insert({
        status: { ...resultJsonMetadata, age },
        updatedat: new Date().toISOString(),
      });

    console.log(error);
  }

  public static async getInstance(): Promise<StateManager> {
    if (!StateManager.instance) {
      StateManager.instance = new StateManager();
      await StateManager.instance.init();
    }
    return StateManager.instance;
  }
}

export default StateManager;
