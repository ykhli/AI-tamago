import { SupabaseClient, createClient } from "@supabase/supabase-js";
import { INTERACTION } from "./interaction";
import { PromptTemplate } from "langchain/prompts";
import { getModel } from "./model";
import { LLMChain } from "langchain/chains";

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

  public async update(vectorSearchResult?: any[]) {
    const statusData = await this.getLatestStatus();
    const status = statusData.status;
    const preferences = vectorSearchResult
      ? vectorSearchResult
          .map((item) => (item.content ? item.content : ""))
          .join("\n")
      : "No preferences";
    const lastStatusTs = statusData!.updatedat;
    const age = status!.age ? status!.age + 1 : 1; // 1 tick older!
    const lastInteractions =
      (await this.getInteractionsSince(lastStatusTs)) || [];

    const prompt = PromptTemplate.fromTemplate(`
      ONLY return JSON as output. no prose. 
      
      You are a virtual pet, about your preferences: 
      ${preferences}
      
      Here's the most recent interactions you had and their timestamps:
      {lastInteractions}

      If there is no interaction above, it means you haven't had interactions with your owner for a while. Your happiness, health and hunger level should decrease accordingly. 

      Your previous status: 
      {status}

      You get hungry if you haven't had food you liked. You get unhappy if you haven't been played within the last hour. 
      You get unhealthy if you ate too much, ate something you hate, or simply caught cold from visiting friends. 
      You are unhappy when you are disciplined, sick, or are not clean. You are generally in a good mood after bath. 
      You die when happiness = 0, health = 0 and hunger = 10. 
      You poop frequently. Poop level can ONLY increase and never decrease. The more you eat, the more you poop. You will need your owner give you a bath to clean you up. Poop level is 0-10, 10 being the max (you really, really need a bath)
      
      The time now is ${new Date().toISOString()}.
      Return your current status in JSON based on your interaction data above. Include a comment explaining why you feel this way.

     
      Example (for demonstration purpose) - Max value for each field is 10, min value for each field is 0.
      {{ "hunger": 0, "happiness": 3, "health": 1, "comment": "I'm sad that I haven't had much interaction with my owner", "poop": 1}}

      `);
    console.log("lastInteractions", lastInteractions);
    const lastInteractionsString = lastInteractions
      .map((interaction) => {
        return `Interaction: ${
          INTERACTION[interaction.interaction]
        }, ${JSON.stringify(interaction.metadata)},  at ${
          interaction.updatedat
        }`;
      })
      .join("\n ");

    const stateChain = new LLMChain({
      llm: this.model,
      prompt: prompt,
    });

    const result = await stateChain
      .call({
        lastInteractions: lastInteractionsString,
        status: JSON.stringify({
          health: status.health,
          happiness: status.happiness,
          hunger: status.hunger,
          poop: status.poop,
        }),
      })
      .catch(console.error);

    const { text } = result!;
    const resultJsonMetadata = JSON.parse(text);
    // TODO - validate or retry here
    resultJsonMetadata.poop = resultJsonMetadata.poop
      ? resultJsonMetadata.poop
      : 0;

    await this.updateTamagotchiStatus({
      ...resultJsonMetadata,
      poop:
        parseInt(status.poop) > parseInt(resultJsonMetadata.poop)
          ? parseInt(status.poop)
          : parseInt(resultJsonMetadata.poop),
      age,
    });
  }

  public async getInteractionsSince(timestamp: string) {
    const { data, error } = await this.dbClient
      .from("tamagotchi_interactions")
      .select()
      .gt("updatedat", timestamp);
    if (error) {
      console.error(error);
    }
    return data;
  }

  public async getLastInteractions() {
    const { data, error } = await this.dbClient
      .from("tamagotchi_interactions")
      .select()
      .order("updatedat", { ascending: false })
      .limit(10);
    if (error) {
      console.error(error);
    }
    return data;
  }
  public async getLatestStatus() {
    const { data, error } = await this.dbClient
      .from("tamagotchi_status")
      .select()
      .order("updatedat", { ascending: false })
      .limit(1);
    if (error) {
      console.error("error: ", error);
    }
    return data![0];
  }

  public async saveInteraction(interaction: INTERACTION, metadata: any) {
    const { error } = await this.dbClient
      .from("tamagotchi_interactions")
      .insert({
        interaction,
        metadata,
        updatedat: new Date().toISOString(),
      });
    if (error) {
      console.log(error);
    }
  }

  public async updateTamagotchiStatus(newStatus: any) {
    const { error } = await this.dbClient.from("tamagotchi_status").insert({
      status: newStatus,
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
