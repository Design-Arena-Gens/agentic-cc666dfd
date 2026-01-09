import { NextResponse } from "next/server";

const OPENAI_ENDPOINT = "https://api.openai.com/v1/chat/completions";

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

type ChatPayload = {
  messages: ChatMessage[];
  model?: string;
};

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing OPENAI_API_KEY environment variable." },
      { status: 500 },
    );
  }

  let payload: ChatPayload | null = null;

  try {
    payload = (await request.json()) as ChatPayload;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload." },
      { status: 400 },
    );
  }

  if (
    !payload ||
    !Array.isArray(payload.messages) ||
    payload.messages.length === 0
  ) {
    return NextResponse.json(
      { error: "Request is missing chat messages." },
      { status: 400 },
    );
  }

  const model = payload.model ?? "gpt-4o-mini";

  try {
    const response = await fetch(OPENAI_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: payload.messages,
        temperature: 0.7,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      const detail =
        (error as { error?: { message?: string } } | null)?.error?.message ??
        "Unexpected response from OpenAI.";

      return NextResponse.json(
        { error: detail },
        { status: response.status },
      );
    }

    const completion = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };

    const content = completion.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "OpenAI returned an empty response." },
        { status: 502 },
      );
    }

    return NextResponse.json({ content });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred.";

    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}
