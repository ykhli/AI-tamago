import { inngest } from "./client";
import StateManager from "@/app/utils/state";
import MemoryManager from "@/app/utils/memory";

export const inngestTick = inngest.createFunction(
  { id: "tick" },
  { cron: "*/5 * * * *" },
  async ({ step }) => {
    await step.run("embedding-search", async () => {
      const memoryManager = await MemoryManager.getInstance();
      return await memoryManager.vectorSearch(
        "what's your favorite activities or food"
      );
    });

    const vectorSearchResult = await step.waitForEvent(
      "vectorsearch.complete",
      {
        event: "vectorsearch.complete",
        timeout: "2m",
      }
    );

    if (vectorSearchResult) {
      await step.run("inngest-tick", async () => {
        const stateManager = await StateManager.getInstance();
        return stateManager.update(vectorSearchResult.data.result);
      });
    }
  }
);
