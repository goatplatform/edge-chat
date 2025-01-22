import { LMStudioClient } from 'npm:@lmstudio/sdk';

// We create a single client to connect to the running LM Studio instance.
// Because of Deno's module system, this will be a singleton if we just import it elsewhere.
const client = new LMStudioClient();

// We might want to load the model just once at startup.
// For example, if you always want to use the same 3B model:
let loadedModel: Awaited<ReturnType<(typeof client)['llm']['load']>> | null =
  null;

export async function initLmStudio() {
  // Make sure your LM Studio app is running, and that you have "mlx-community/Llama-3.2-3B-Instruct-4bit" installed.
  // This loads the model so we can respond with it later.
  if (!loadedModel) {
    loadedModel = await client.llm.load(
      'mlx-community/Llama-3.2-3B-Instruct-4bit',
      {
        // CPU-only or GPU config if you want:
        config: {
          // generation: { maxTokens: 256, temperature: 0.7, ... }
        },
        verbose: true,
      }
    );
  }
}

// Our actual function to get a response from the model
export async function lmstudioRespond(prompt: string): Promise<string> {
  if (!loadedModel) {
    throw new Error(
      'LM Studio model not loaded yet. Did you call initLmStudio()?'
    );
  }

  // We'll do single-turn usage. You can pass an array of messages if you prefer multi-turn context.
  // (If you want multi-turn, see the "Multi-turn" note below.)
  const responseStream = loadedModel.respond([
    { role: 'user', content: prompt },
  ]);

  let result = '';
  for await (const chunk of responseStream) {
    // chunk is { content: string, done?: boolean, ... }
    result += chunk.content;
  }
  return result;
}
