import dotenv from "dotenv";
import { NextResponse } from "next/server";
import { inngest } from "../../../inngest/client";
import { createClient } from "@supabase/supabase-js";
import StateManager from "@/app/utils/state";

dotenv.config({ path: `.env.local` });

export async function POST(req: Request) {
  // TODO - this should be invoked every second to update tamagotchi status. Things like:
  // Decrease happiness / increase hunger
  // Poop
  // Get sick
  // Sleep (based on clock)
  // .... or other things LLM can think of...

  const url = process.env.SUPABASE_URL!;
  const privateKey = process.env.SUPABASE_PRIVATE_KEY!;
  const dbClient = createClient(url, privateKey);
  const status = await dbClient.from("tamagotchi_interactions").select();
  console.log("status", JSON.stringify(status));

  const stateManager = await StateManager.getInstance();
  // Generate a new Tamagotchi and fill in its preferences

  stateManager.update();

  // await inngest.send({
  //   name: "test/hello.world",
  //   data: {
  //     email: "testing tick!!",
  //   },
  // });

  return NextResponse.json({});
}
