import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// --- Manually load the root .env file (no extra dependency needed) ---
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../../.env"); // project root .env

if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const [key, ...rest] = trimmed.split("=");
    const value = rest.join("=").trim().replace(/^["']|["']$/g, "");
    if (key && !process.env[key.trim()]) {
      process.env[key.trim()] = value;
    }
  }
}

const API_KEY = process.env["OPENROUTER_API_KEY"];

if (!API_KEY) {
  console.error("OPENROUTER_API_KEY not found. Add it to your root .env file.");
  process.exit(1);
}

type OpenRouterModel = {
  id: string;
  name: string;
  context_length: number;
  pricing: { prompt: string; completion: string };
};

async function listFreeModels() {
  const res = await fetch("https://openrouter.ai/api/v1/models");
  const json = (await res.json()) as { data: OpenRouterModel[] };
  const free = json.data.filter(
    (m) => Number(m.pricing.prompt) === 0 && Number(m.pricing.completion) === 0,
  );
  console.log(`\nFound ${free.length} free models:\n`);
  for (const m of free.slice(0, 15)) {
    console.log(`  ${m.id}  (context: ${m.context_length})`);
  }
  return free;
}

async function testChatCompletion(modelId: string) {
  console.log(`\nTesting a real chat completion with: ${modelId}\n`);
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost",
      "X-Title": "LeadPilot",
    },
    body: JSON.stringify({
      model: modelId,
      messages: [
        {
          role: "user",
          content:
            "Reply with exactly one short sentence confirming you received this test message.",
        },
      ],
    }),
  });

  if (!res.ok) {
    console.error(`Request failed: ${res.status} ${res.statusText}`);
    console.error(await res.text());
    return;
  }

  const json = (await res.json()) as any;
  console.log("Response:\n", json.choices?.[0]?.message?.content ?? json);
}

async function main() {
  const free = await listFreeModels();
  // Pick the first free model from the list to test with.
  // You can also hardcode a specific model id here instead.
  const candidate = free[0]?.id;
  if (!candidate) {
    console.error("No free models found right now.");
    return;
  }
  await testChatCompletion(candidate);
}

main().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});