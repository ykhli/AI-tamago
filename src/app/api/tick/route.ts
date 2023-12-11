import dotenv from "dotenv";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import StateManager from "@/app/utils/state";
import { getAuth } from "@clerk/nextjs/server";
import { NextApiRequest } from "next";
import MemoryManager from "@/app/utils/memory";

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
    const vectorSearchResult = await memoryManager.vectorSearch(
      "what's your favorite activities or food",
      { userId }
    );

    stateManager.update(vectorSearchResult, userId);
  }
  return NextResponse.json({});
}
