import dotenv from "dotenv";
import { NextResponse } from "next/server";
import { inngest } from "../../../inngest/client";
import StateManager from "@/app/utils/state";

dotenv.config({ path: `.env.local` });

export async function GET(req: Request) {
  const stateManager = await StateManager.getInstance();
  // Generate a new Tamagotchi and fill in its preferences

  stateManager.update();
  // inngest.createFunction(
  //   { id: "tick" },
  //   { cron: "0 * * * * *" },
  //   async ({ step }) => {
  //     await step.run("tick", async () => {

  //     });
  //   }
  // );

  return NextResponse.json({});
}
