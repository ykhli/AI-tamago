import dotenv from "dotenv";
import arcjet, { rateLimit } from "@arcjet/next";
import { NextResponse } from "next/server";
import { inngest } from "../../../inngest/client";
import { createClient } from "@supabase/supabase-js";
import StateManager from "@/app/utils/state";
import { NextApiResponse } from "next";

dotenv.config({ path: `.env.local` });

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    rateLimit({
      mode: "LIVE",
      characteristics: ["ip.src"],
      window: "1m",
      max: 1,
      timeout: "10m",
    }),
  ],
});

export async function POST(req: Request) {
  // TODO - this should be invoked every second or minute to update tamagotchi status. Things like:
  // Decrease happiness / increase hunger
  // Poop
  // Get sick
  // Sleep (based on clock)
  // .... or other things LLM can think of...
  const decision = await aj.protect(req);
  if (decision.isDenied()) {
    return NextResponse.json(
      {
        error: "Too Many Requests",
        reason: decision.reason,
      },
      {
        status: 429,
      }
    );
  }

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
