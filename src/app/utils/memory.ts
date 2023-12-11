import { SupabaseClient, createClient } from "@supabase/supabase-js";
import { INTERACTION } from "./interaction";
import { pipeline } from "@xenova/transformers";
import { inngest } from "@/inngest/client";

class MemoryManager {
  private static instance: MemoryManager;

  private dbClient: SupabaseClient;

  public constructor() {
    const auth = {
      detectSessionInUrl: false,
      persistSession: false,
      autoRefreshToken: false,
    };
    const url = process.env.SUPABASE_URL!;
    const privateKey = process.env.SUPABASE_PRIVATE_KEY!;
    this.dbClient = createClient(url, privateKey, { auth });
  }

  public async init() {}

  public async saveToMemory(content: string, metadata: any, userid: string) {
    const embedding = await this.generateEmbedding(content);
    const supabaseClient = <SupabaseClient>this.dbClient;
    const error = await supabaseClient
      .from("documents")
      .insert({ embedding, metadata: { ...metadata, userid }, content });

    console.debug("INFO: saved to Supabase.");
    console.debug("INFO: error", error);
  }

  public async generateEmbedding(content: string) {
    console.log("generateEmbedding", content);
    const generateEmbedding = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );

    // Generate a vector using Transformers.js
    const output = await generateEmbedding(content, {
      pooling: "mean",
      normalize: true,
    });

    // Extract the embedding output
    const embedding = Array.from(output.data);
    return embedding;
  }

  public async vectorSearch(contentToSearch: string, filter?: any) {
    const embedding = await this.generateEmbedding(contentToSearch);

    const result = await this.dbClient.rpc("match_documents", {
      query_embedding: embedding,
      match_count: 3,
      filter,
    });

    if (result.error) {
      console.error("ERROR: ", result.error);
    }

    inngest.send({
      name: "vectorsearch.complete",
      data: { result: result.data },
    });
    console.log("vector search result", result);
    return result.data || "";
  }

  public static async getInstance(): Promise<MemoryManager> {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
      await MemoryManager.instance.init();
    }
    return MemoryManager.instance;
  }

  public async writeToHistory(text: string) {}

  public async readLatestHistory() {}

  public async seedChatHistory() {}
}

export default MemoryManager;
