import dotenv from "dotenv";
import { NextResponse } from "next/server";

dotenv.config({ path: `.env.local` });

export async function POST(req: Request) {
  // TODO - this should be invoked every second to update tamagotchi status. Things like:
  // Decrease happiness / increase hunger
  // Poop
  // Get sick
  // Sleep (based on clock)
  // .... or other things LLM can think of...
  return NextResponse.json({});
}
