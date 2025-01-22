import { randomInt } from "https://jsr.io/@goatdb/goatdb/0.0.47/base/math.ts";
import { sleep } from "https://jsr.io/@goatdb/goatdb/0.0.47/base/time.ts";

const kResponses = [
  `I'm here to assist you! Could you clarify your request so I can provide the best answer?`,
  `Interesting question! Let me think about that for a moment.`,
  `I'm not sure I understand. Could you rephrase or provide more details?`,
  `Thanks for asking! Unfortunately, I don't have enough information to answer that right now.`,
  `That's a great point! Let me know how I can help further.`,
];

export async function dummy(_prompt: string): Promise<string> {
  await sleep(randomInt(0, 1000) + 2000);
  return kResponses[randomInt(0, kResponses.length)];
}
