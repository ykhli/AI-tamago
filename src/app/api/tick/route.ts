import dotenv from "dotenv";
import { NextResponse } from "next/server";
import { inngest } from "../../../inngest/client";

dotenv.config({ path: `.env.local` });

export async function GET(req: Request) {
  // TODO - this should be invoked every second to update tamagotchi status. Things like:
  // Decrease happiness / increase hunger
  // Poop
  // Get sick
  // Sleep (based on clock)
  // .... or other things LLM can think of...
  await inngest.send({
    name: "test/hello.world",
    data: {
      email: "testing tick!!",
    },
  });

  return NextResponse.json({});
}
