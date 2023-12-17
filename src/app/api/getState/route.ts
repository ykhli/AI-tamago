import dotenv from "dotenv";
import { NextResponse } from "next/server";
import { inngest } from "../../../inngest/client";
import { createClient } from "@supabase/supabase-js";
import StateManager from "@/app/utils/state";
import { stat } from "fs";

dotenv.config({ path: `.env.local` });

export async function POST(req: Request) {
  const stateManager = await StateManager.getInstance();
  const latestStatus = await stateManager.getLatestStatus();
  const state = latestStatus ? latestStatus.status : [];

  return NextResponse.json(state);
}
