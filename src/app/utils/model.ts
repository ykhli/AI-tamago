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
      model: "meta/codellama-13b-instruct:ca8c51bf3c1aaf181f9df6f10f31768f065c9dddce4407438adc5975a59ce530",
    });
  } else if (model == LlmModel.Ollama) {
    const endpoint = (process.env.OLLAMA_URL || "").toLowerCase();
    console.debug("Using Ollama", endpoint);
    return new Ollama({
      baseUrl: endpoint,
      model: "codellama",
      format: "json",
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
