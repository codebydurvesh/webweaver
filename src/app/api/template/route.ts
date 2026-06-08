import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { BASE_PROMPT } from "@/lib/prompts";
import { basePrompt as nodeBasePrompt } from "@/lib/defaults/node";
import { basePrompt as reactBasePrompt } from "@/lib/defaults/react";

export const runtime = "nodejs";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content:
          "IMPORATANT: Only return word 'react' or 'node' based on the user prompt. If the user prompt is related to frontend development, return 'react'. If the user prompt is related to backend development, return 'node'. Do not return anything else.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const answer = response.choices[0]?.message?.content?.toLowerCase(); // react or node

  if (answer === "react") {
    return NextResponse.json({
      prompts: [
        BASE_PROMPT,
        `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
      ],
      uiPrompt: [reactBasePrompt],
    });
  }

  if (answer === "node") {
    return NextResponse.json({
      prompts: [
        BASE_PROMPT,
        `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nodeBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
      ],
      uiPrompt: [nodeBasePrompt],
    });
  }

  return NextResponse.json(
    { error: "Invalid response from model", response: answer },
    { status: 403 }
  );
}
