import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { getSystemPrompt } from "@/lib/prompts";
import { toApiError } from "@/lib/apiError";

export const runtime = "nodejs";
export const maxDuration = 60;

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  let completion;
  try {
    completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      stream: true,
      messages: [
        {
          role: "system",
          content: getSystemPrompt(),
        },
        ...messages,
      ],
    });
  } catch (err) {
    const { status, message } = toApiError(err);
    return NextResponse.json({ error: message }, { status });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of completion) {
          const text = chunk.choices[0]?.delta?.content;
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }
      } catch (err) {
        controller.error(err);
        return;
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
