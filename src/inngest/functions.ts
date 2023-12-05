import { inngest } from "./client";
import StateManager from "@/app/utils/state";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { event, body: "Hello, World!" };
  }
);

export const inngestTick = inngest.createFunction(
  { id: "tick" },
  { cron: "*/5 * * * *" },
  async ({ step }) => {
    await step.run("inngest-tick", async () => {
      const stateManager = await StateManager.getInstance();
      return stateManager.update();
    });
  }
);
