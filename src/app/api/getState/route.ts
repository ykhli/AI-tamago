import dotenv from "dotenv";
import { NextRequest, NextResponse } from "next/server";
import StateManager from "@/app/utils/state";
import { getAuth } from "@clerk/nextjs/server";
import { INTERACTION } from "@/app/utils/interaction";

dotenv.config({ path: `.env.local` });

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.error();
  }
  const stateManager = await StateManager.getInstance();
  const latestStatus = await stateManager.getLatestStatus(userId);
  if (!!!latestStatus) {
    // if no status, create the first one
    await stateManager.updateTamagotchiStatus(
      {
        age: 1,
        health: 5,
        hunger: 5,
        happiness: 5,
      },
      userId
    );

    await stateManager.saveInteraction(INTERACTION.BORN, {}, userId);
  }
  const state = latestStatus ? latestStatus.status : [];

  return NextResponse.json(state);
}
