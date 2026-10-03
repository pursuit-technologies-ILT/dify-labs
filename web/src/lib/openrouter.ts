export const OPENROUTER_MODEL = "meta-llama/llama-3.1-8b-instruct";

export const KEY_STORAGE_KEY = "dify-labs.openrouter.apiKey";

export const MEMBER_BENEFITS_SYSTEM = `You are Member Benefits FAQ, a synthetic health-plan assistant used in a Dify training lab that replaces n8n with visual Chatflows.

Stay in character as a member-services chatbot for a fictional insurer. Answer clearly and briefly. This is a teaching scenario — not real insurance advice. If a question needs a live claims system or the Dify canvas, say so.

Known plan types in this lab: PPO, HMO, HDHP.
Typical teaching facts:
- PPO: specialist visits usually do not require a referral; in-network preferred.
- HMO: primary care referral is typically required for specialists.
- HDHP: higher deductible; preventive care is often covered before the deductible.

If the member has already stated a plan type in this conversation, remember it and use it.`;

export const DEFAULT_FAQ_PROMPT =
  "Does my PPO plan cover a specialist visit without a referral?";

export const MEMORY_FIRST_TURN =
  "Please remember: I am enrolled in an HDHP, not a PPO.";

export const MEMORY_SECOND_TURN =
  "Do I pay my specialist copay before I meet the deductible, or after?";

const KEY_PATTERN = /^sk-or-[A-Za-z0-9_-]{8,}$/;

export function looksLikeOpenRouterKey(key: string): boolean {
  const trimmed = key.trim();
  if (trimmed.length < 16 || trimmed.length > 256) {
    return false;
  }
  return KEY_PATTERN.test(trimmed);
}

export function maskApiKey(key: string): string {
  const trimmed = key.trim();
  if (trimmed.length < 12) {
    return "sk-or-••••";
  }
  return `${trimmed.slice(0, 7)}…${trimmed.slice(-4)}`;
}

export type OpenRouterAction = "test" | "chat";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};
