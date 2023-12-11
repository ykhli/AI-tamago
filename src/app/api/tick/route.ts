import dotenv from "dotenv";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import StateManager from "@/app/utils/state";
import { getAuth } from "@clerk/nextjs/server";
import MemoryManager from "@/app/utils/memory";
import { rateLimit } from "@/app/utils/rateLimit";

dotenv.config({ path: `.env.local` });

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);

  if (userId) {
    // Only send tick this way in prod
    const url = process.env.SUPABASE_URL!;
    const privateKey = process.env.SUPABASE_PRIVATE_KEY!;
    const dbClient = createClient(url, privateKey);
    const status = await dbClient.from("tamagotchi_interactions").select();
    console.log("status", JSON.stringify(status));

    const stateManager = await StateManager.getInstance();
    const memoryManager = await MemoryManager.getInstance();
    // Generate a new Tamagotchi and fill in its preferences
    if (await stateManager.checkIfShouldTick(userId)) {
      console.log("INFO: tick");
      const vectorSearchResult = await memoryManager.vectorSearch(
        "what do you enjoy doing or eating?",
        { userid: userId }
      );

      await stateManager.update(vectorSearchResult, userId);
    }
    console.log("INFO: no tick");
  }
  return NextResponse.json({});
}
