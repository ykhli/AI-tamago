import { OpenAI } from "langchain/llms/openai";
import { Replicate } from "langchain/llms/replicate";
import { Ollama } from "langchain/llms/ollama";

enum LlmModel {
  OpenAI = "openai",
  ReplicateLlama = "replicate_llama",
  Ollama = "ollama",
}
export function getModel() {
  const model = (process.env.LLM_MODEL || "").toLowerCase();
  console.log("model", model);
  if (model == LlmModel.ReplicateLlama) {
    console.debug("Using Replicate Llama");
    return new Replicate({
      apiKey: process.env.REPLICATE_API_TOKEN,
      model:
        //newer versions have emojis broken 😔
        "meta/llama13b-v2-chat:2d19859030ff705a87c746f7e96eea03aefb71f166725aee39692f1476566d48",
      input: {
        system_prompt: `You are a helpful assistant, that only communicates using JSON files and no other words.
                The expected output from you has to be: 
                    {
                        "text": {response}
                    }
                "`,
      },
    });
  } else if (model == LlmModel.Ollama) {
    const endpoint = (process.env.OLLAMA_URL || "").toLowerCase();
    console.debug("Using Ollama", endpoint);
    return new Ollama({
      baseUrl: endpoint,
      model: "codellama",
    });
  } else {
    //default to OpenAI
    console.debug("Using default (OpenAI)");
    return new OpenAI({
      modelName: "gpt-3.5-turbo-16k",
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
  }
}
