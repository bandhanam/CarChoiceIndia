import { NextResponse } from "next/server";
import { coerceCarMarketEstimate } from "@/lib/openai-estimate-coerce";

export const runtime = "nodejs";

interface Body {
  brand: string;
  model: string;
  year?: number;
  category?: string;
  variantName?: string;
  /** App’s current list price for context only */
  referencePriceInr?: number;
}

export async function POST(request: Request) {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) {
    return NextResponse.json(
      {
        error:
          "OPENAI_API_KEY is not set. Add it to .env.local for this experimental feature.",
      },
      { status: 503 }
    );
  }

  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const brand = String(body.brand || "").trim();
  const model = String(body.model || "").trim();
  if (!brand || !model) {
    return NextResponse.json(
      { error: "brand and model are required" },
      { status: 400 }
    );
  }

  const modelName = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";

  const userContext = [
    `Car: ${brand} ${model}`,
    body.year ? `Model year context: ${body.year}` : "",
    body.category ? `Segment: ${body.category}` : "",
    body.variantName ? `Variant: ${body.variantName}` : "",
    body.referencePriceInr
      ? `Reference list price in app (may be outdated): ₹${body.referencePriceInr}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  const system = `You help with the Indian passenger car market. Return ONLY valid JSON (no markdown) matching this shape:
{
  "disclaimer": "short legal-style note that this is not official pricing",
  "currency": "INR",
  "estimatedExShowroomMinInr": number,
  "estimatedExShowroomMaxInr": number,
  "highlights": string[],
  "featureNotes": string[] (notable equipment or recent changes if known),
  "confidenceNote": string (one sentence on uncertainty),
  "asOfHint": string (e.g. approximate era / 2026 India market)
}
Rules:
- Prices are indicative ex-showroom India in INR (full numbers, not lakhs text).
- If unsure, widen the min-max range and say so in confidenceNote.
- Do not claim real-time or dealer-specific prices.
- highlights: max 6 short bullets.`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: modelName,
        temperature: 0.35,
        max_tokens: 900,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          {
            role: "user",
            content: `Give an indicative ex-showroom price band and short notes for India.\n\n${userContext}`,
          },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { error: "OpenAI request failed", detail: errText.slice(0, 200) },
        { status: 502 }
      );
    }

    const completion: unknown = await res.json();
    const content = (completion as { choices?: { message?: { content?: string } }[] })
      ?.choices?.[0]?.message?.content;
    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "Empty model response" },
        { status: 502 }
      );
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      return NextResponse.json(
        { error: "Model returned non-JSON" },
        { status: 502 }
      );
    }

    const estimate = coerceCarMarketEstimate(parsed);
    if (!estimate) {
      return NextResponse.json(
        { error: "Could not parse estimate fields" },
        { status: 502 }
      );
    }

    return NextResponse.json({ estimate, model: modelName });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
