"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

type Role = "user" | "assistant";

type Message = {
  id: string;
  role: Role;
  content: string;
};

const SUGGESTED_PROMPTS = [
  "Help me outline a landing page for a climate-tech startup.",
  "Draft an onboarding email welcoming a new teammate.",
  "Summarize the main takeaways from the latest AI safety research.",
  "Turn this feature idea into a user story with acceptance criteria.",
];

const MODELS = [
  { id: "gpt-4o-mini", label: "gpt-4o-mini" },
  { id: "gpt-4.1-mini", label: "gpt-4.1-mini" },
  { id: "o4-mini", label: "o4-mini" },
];

const systemIntro =
  "Hey there! I'm your Agentic workspace. Tell me what you're building and I'll help you explore ideas, polish copy, or break down complex problems.";

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `m-${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 8)}`;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { id: createId(), role: "assistant", content: systemIntro },
  ]);
  const [input, setInput] = useState("");
  const [model, setModel] = useState(MODELS[0]?.id ?? "gpt-4o-mini");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const canSend = input.trim().length > 0 && !isLoading;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!textareaRef.current) {
      return;
    }

    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${Math.min(
      textareaRef.current.scrollHeight,
      160,
    )}px`;
  }, [input]);

  const assistantMessages = useMemo(
    () => messages.filter((message) => message.role === "assistant").length,
    [messages],
  );

  async function sendMessage(content: string) {
    const trimmed = content.trim();
    if (!trimmed) {
      return;
    }

    const userMessage: Message = {
      id: createId(),
      role: "user",
      content: trimmed,
    };

    setMessages((previous) => [...previous, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(({ role, content }) => ({
            role,
            content,
          })),
          model,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;

        const message =
          payload?.error ?? `The model responded with ${response.status}.`;

        throw new Error(message);
      }

      const payload = (await response.json()) as { content?: string };
      const assistantReply = payload.content?.trim();

      if (!assistantReply) {
        throw new Error("No content returned from the model.");
      }

      setMessages((previous) => [
        ...previous,
        { id: createId(), role: "assistant", content: assistantReply },
      ]);
    } catch (caught) {
      const reason =
        caught instanceof Error
          ? caught.message
          : "Something went wrong while calling the AI model.";

      setError(reason);
      setMessages((previous) => [
        ...previous,
        {
          id: createId(),
          role: "assistant",
          content:
            "I hit an issue reaching the model. Double-check your API key and try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
      textareaRef.current?.focus();
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (canSend) {
      void sendMessage(input);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-900 via-slate-950 to-black text-slate-50">
      <header className="border-b border-white/10 bg-black/40 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6 lg:px-8">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-sky-400">Agentic</p>
            <h1 className="text-2xl font-semibold">AI Studio</h1>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-300">
            <span className="hidden sm:inline">
              {assistantMessages > 1
                ? `${assistantMessages} ideas delivered`
                : "Let’s build something remarkable"}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-200">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Live
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 pb-12 pt-8 lg:px-8">
        <section className="grid gap-6 rounded-3xl border border-white/5 bg-white/5 p-8 shadow-2xl shadow-black/40 backdrop-blur-sm lg:grid-cols-[2fr,1fr]">
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-3xl font-semibold text-white">
                Create at the pace of thought.
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                Prototype ideas, iterate on copywriting, and orchestrate workflows using
                a single conversational canvas powered by production-ready AI models.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => {
                    setInput(prompt);
                    textareaRef.current?.focus();
                  }}
                  className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-left text-sm text-slate-100 transition hover:border-sky-500/50 hover:bg-sky-500/10 hover:text-white"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 px-6 py-4 text-sm text-slate-300">
              <p className="font-medium text-slate-200">Working with your own stack?</p>
              <p className="mt-2">
                Drop in your `OPENAI_API_KEY` and deploy to Vercel once you are ready to
                share. Every conversation stays on your infrastructure.
              </p>
            </div>
          </div>

          <aside className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-black/50 p-6 text-sm text-slate-200">
            <div>
              <p className="font-medium text-white">Model</p>
              <p className="text-xs text-slate-400">
                Choose an OpenAI Responses model for this workspace.
              </p>
              <div className="mt-3 space-y-2">
                {MODELS.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition hover:border-sky-500/70 hover:bg-sky-500/10"
                  >
                    <span>{item.label}</span>
                    <input
                      type="radio"
                      name="model"
                      value={item.id}
                      checked={model === item.id}
                      onChange={(event) => setModel(event.target.value)}
                      className="h-4 w-4 accent-sky-400"
                    />
                  </label>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-sky-500/40 bg-sky-500/10 px-4 py-3 text-xs leading-relaxed text-sky-100">
              <p className="uppercase tracking-widest text-[0.65rem] text-sky-300">
                Quick tip
              </p>
              <p className="mt-1">
                Press <span className="rounded bg-white/10 px-1 py-0.5">Shift + Enter</span>{" "}
                for multi-line prompts. Hit <span className="rounded bg-white/10 px-1 py-0.5">⌘K</span>{" "}
                to jump back into the composer.
              </p>
            </div>
            <Link
              href="https://vercel.com/templates/ai"
              target="_blank"
              className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-100 transition hover:border-white/30 hover:bg-white/10"
            >
              Explore templates
            </Link>
          </aside>
        </section>

        <section className="mt-8 flex flex-1 flex-col">
          <div className="flex-1 overflow-hidden rounded-3xl border border-white/10 bg-black/40">
            <div className="flex h-full flex-col overflow-y-auto px-6 py-8">
              {messages.map((message) => (
                <article
                  key={message.id}
                  className={`mb-6 max-w-3xl rounded-2xl px-5 py-4 text-sm leading-6 shadow-lg shadow-black/20 ${
                    message.role === "assistant"
                      ? "self-start border border-sky-500/30 bg-sky-500/10 text-slate-100"
                      : "self-end border border-white/10 bg-white/10 text-slate-50"
                  }`}
                >
                  <p className="mb-2 text-xs uppercase tracking-[0.3em] text-slate-400">
                    {message.role === "assistant" ? "Agentic" : "You"}
                  </p>
                  <p className="whitespace-pre-wrap text-base">{message.content}</p>
                </article>
              ))}
              <div ref={endRef} />
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-4 rounded-3xl border border-white/10 bg-white/10 p-4 shadow-xl shadow-black/30"
          >
            <div className="flex items-start gap-4">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask for product strategy, code review, content drafting, or anything else you need."
                className="min-h-[56px] max-h-40 flex-1 resize-none rounded-2xl border border-transparent bg-black/40 px-4 py-3 text-base text-slate-100 placeholder:text-slate-500 focus:border-sky-500/60 focus:outline-none focus:ring-0"
                rows={1}
                disabled={isLoading}
                spellCheck={false}
              />
              <button
                type="submit"
                disabled={!canSend}
                className="inline-flex h-12 items-center rounded-2xl bg-sky-500 px-6 text-sm font-semibold uppercase tracking-[0.25em] text-white transition disabled:cursor-not-allowed disabled:bg-slate-700"
              >
                {isLoading ? "Thinking…" : "Send"}
              </button>
            </div>
            {error && (
              <p className="mt-3 text-xs text-rose-300">
                {error}
              </p>
            )}
          </form>
        </section>
      </main>
    </div>
  );
}
