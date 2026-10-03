import type { ChatMessage } from "@/lib/openrouter";

export type TestResult = {
  modelCount: number;
  hasLabModel: boolean;
  snippet: string;
};

export type TranscriptLine = {
  role: "user" | "assistant";
  content: string;
};

export async function proxyOpenRouter(
  key: string,
  payload: { action: "test" } | { action: "chat"; messages: ChatMessage[] },
): Promise<Record<string, unknown>> {
  const response = await fetch("/api/openrouter", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-openrouter-key": key,
    },
    body: JSON.stringify(payload),
  });
  const json = (await response.json()) as Record<string, unknown>;
  if (!response.ok || json.ok !== true) {
    const error =
      typeof json.error === "string"
        ? json.error
        : "The proxy could not complete this OpenRouter call.";
    throw new Error(error);
  }
  return json;
}
