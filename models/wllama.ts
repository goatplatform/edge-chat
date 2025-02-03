import { Wllama } from "@wllama/wllama";

const ASSETS_CONFIG = {
  "single-thread/wllama.wasm": "/assets/wllama-single.wasm",
  "multi-thread/wllama.wasm": "/assets/wllama-multi.wasm",
  "model/default": "/assets/model.gguf",
};

let wllamaInstance: Wllama | null = null;

let modelLoaded = false;

async function initializeWLlama() {
  if (modelLoaded) return;

  try {
    console.log("Creating new Wllama instance...");
    wllamaInstance = new Wllama(ASSETS_CONFIG);

    console.log("Loading model file...");
    const modelResponse = await fetch("/assets/models/model.gguf");
    if (!modelResponse.ok) {
      throw new Error(
        `Failed to load model: ${modelResponse.status} ${modelResponse.statusText}`,
      );
    }

    const modelArrayBuffer = await modelResponse.arrayBuffer();
    console.log("Model loaded, size:", modelArrayBuffer.byteLength);

    const modelFile = new File([modelArrayBuffer], "model.gguf", {
      type: "application/octet-stream",
    });

    console.log("Initializing model with explicit path...");
    await wllamaInstance.loadModel([modelFile], {
      modelPath: "/assets/models/model.gguf",
    });

    modelLoaded = true;
    console.log("WLlama initialized successfully");
  } catch (error) {
    console.error("WLlama initialization error:", error);
    throw error;
  }
}

export async function wllamaGenerate(
  prompt: string,
  onProgress: (status: string, progress: number) => void,
): Promise<string> {
  try {
    if (!modelLoaded) {
      onProgress("Loading model...", 0);
      await initializeWLlama();
      onProgress("Model loaded", 25);
    }

    if (!wllamaInstance) {
      throw new Error("WLlama failed to initialize");
    }

    onProgress("Starting generation...", 50);

    let finalResponse = "";
    const completion = await wllamaInstance.createCompletion(prompt, {
      nPredict: 50,
      sampling: {
        temp: 0.5,
        top_k: 40,
        top_p: 0.9,
      },
      onNewToken: (token: string, piece: string, currentText: string) => {
        finalResponse = currentText;
        onProgress("Thinking...", 75);
      },
    });

    onProgress("Done!", 100);
    return completion;
  } catch (error) {
    console.error("WLlama generation error:", error);
    throw error;
  }
}
