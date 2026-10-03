import { NextResponse } from "next/server";

import {
  looksLikeOpenRouterKey,
  OPENROUTER_MODEL,
  type ChatMessage,
  type OpenRouterAction,
} from "@/lib/openrouter";

const OPENROUTER_BASE = "https://openrouter.ai/api/v1";

function unusedNever(value: never): never {
  throw new Error(`Unhandled OpenRouter action: ${String(value)}`);
}

function extractKey(request: Request): string {
  const headerKey = request.headers.get("x-openrouter-key")?.trim() ?? "";
  if (headerKey) {
    return headerKey;
  }
  const auth = request.headers.get("authorization") ?? "";
  if (auth.toLowerCase().startsWith("bearer ")) {
    return auth.slice(7).trim();
  }
  return "";
}

function publicErrorForStatus(status: number, bodyText: string): string {
  if (status === 401) {
    return "OpenRouter rejected this key (401). Create a new key at openrouter.ai/keys and paste it again — do not use a Dify Studio key.";
  }
  if (status === 402) {
    return "OpenRouter reports insufficient credits (402). Add credits or pick a free/light model in your OpenRouter account, then retry.";
  }
  if (status === 429) {
    return "OpenRouter rate-limited this request (429). Wait a moment and try again.";
  }
  return `OpenRouter returned ${status}. ${bodyText.slice(0, 280)}`;
}

function assistantTextFromCompletion(payload: unknown): string {
  if (!payload || typeof payload !== "object") {
    return "";
  }
  const choices = (payload as { choices?: unknown }).choices;
  if (!Array.isArray(choices) || choices.length === 0) {
    return "";
  }
  const message = (choices[0] as { message?: { content?: unknown } }).message;
  const content = message?.content;
  if (typeof content === "string") {
    return content;
  }
  return "";
}

async function openRouterFetch(
  key: string,
  path: string,
  init?: RequestInit,
): Promise<Response> {
  return fetch(`${OPENROUTER_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://dify-labs-walkthrough.vercel.app",
      "X-Title": "Dify Labs Walkthrough",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
}

export async function POST(request: Request) {
  const key = extractKey(request);
  if (!looksLikeOpenRouterKey(key)) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "That does not look like an OpenRouter key. Keys start with sk-or- and are created at openrouter.ai/keys.",
      },
      { status: 400 },
    );
  }

  let body: { action?: unknown; messages?: unknown };
  try {
    body = (await request.json()) as { action?: unknown; messages?: unknown };
  } catch {
    return NextResponse.json(
      { ok: false, error: "Request body must be JSON." },
      { status: 400 },
    );
  }

  const action = body.action;
  if (action !== "test" && action !== "chat") {
    return NextResponse.json(
      { ok: false, error: "action must be test or chat." },
      { status: 400 },
    );
  }

  const typedAction: OpenRouterAction = action;

  try {
    switch (typedAction) {
      case "test": {
        const modelsRes = await openRouterFetch(key, "/models");
        if (!modelsRes.ok) {
          const text = await modelsRes.text();
          return NextResponse.json(
            { ok: false, error: publicErrorForStatus(modelsRes.status, text) },
            { status: modelsRes.status === 401 || modelsRes.status === 402 ? modelsRes.status : 502 },
          );
        }
        const modelsJson = (await modelsRes.json()) as {
          data?: Array<{ id?: string }>;
        };
        const ids = Array.isArray(modelsJson.data)
          ? modelsJson.data.map((m) => m.id).filter((id): id is string => Boolean(id))
          : [];
        const hasLabModel = ids.includes(OPENROUTER_MODEL);

        const pingRes = await openRouterFetch(key, "/chat/completions", {
          method: "POST",
          body: JSON.stringify({
            model: OPENROUTER_MODEL,
            max_tokens: 32,
            messages: [
              {
                role: "user",
                content: "Reply with the single word: ready",
              },
            ],
          }),
        });
        if (!pingRes.ok) {
          const text = await pingRes.text();
          return NextResponse.json(
            {
              ok: false,
              modelsOk: true,
              modelCount: ids.length,
              hasLabModel,
              error: publicErrorForStatus(pingRes.status, text),
            },
            { status: pingRes.status === 401 || pingRes.status === 402 ? pingRes.status : 502 },
          );
        }
        const pingJson: unknown = await pingRes.json();
        const snippet = assistantTextFromCompletion(pingJson);
        return NextResponse.json({
          ok: true,
          model: OPENROUTER_MODEL,
          modelCount: ids.length,
          hasLabModel,
          snippet,
        });
      }
      case "chat": {
        const messages = body.messages;
        if (!Array.isArray(messages) || messages.length === 0) {
          return NextResponse.json(
            { ok: false, error: "messages must be a non-empty array." },
            { status: 400 },
          );
        }
        const safeMessages: ChatMessage[] = [];
        for (const item of messages) {
          if (!item || typeof item !== "object") {
            continue;
          }
          const role = (item as ChatMessage).role;
          const content = (item as ChatMessage).content;
          if (
            (role === "system" || role === "user" || role === "assistant") &&
            typeof content === "string" &&
            content.trim().length > 0 &&
            content.length < 8000
          ) {
            safeMessages.push({ role, content: content.trim() });
          }
        }
        if (safeMessages.length === 0) {
          return NextResponse.json(
            { ok: false, error: "No valid chat messages were provided." },
            { status: 400 },
          );
        }
        const chatRes = await openRouterFetch(key, "/chat/completions", {
          method: "POST",
          body: JSON.stringify({
            model: OPENROUTER_MODEL,
            max_tokens: 400,
            messages: safeMessages,
          }),
        });
        if (!chatRes.ok) {
          const text = await chatRes.text();
          return NextResponse.json(
            { ok: false, error: publicErrorForStatus(chatRes.status, text) },
            { status: chatRes.status === 401 || chatRes.status === 402 ? chatRes.status : 502 },
          );
        }
        const chatJson: unknown = await chatRes.json();
        const reply = assistantTextFromCompletion(chatJson);
        if (!reply) {
          return NextResponse.json(
            { ok: false, error: "OpenRouter returned an empty completion." },
            { status: 502 },
          );
        }
        return NextResponse.json({
          ok: true,
          model: OPENROUTER_MODEL,
          reply,
        });
      }
      default: {
        unusedNever(typedAction);
      }
    }
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "Could not reach OpenRouter. Check your network and try again.",
      },
      { status: 502 },
    );
  }
}
