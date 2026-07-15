import arcjet, {
  detectBot,
  shield,
} from "@arcjet/next";
import { NextResponse } from "next/server";

const arcjetKey = process.env.ARCJET_KEY;

if (!arcjetKey) {
  throw new Error("ARCJET_KEY is not defined");
}

const aj = arcjet({
  key: arcjetKey,
  rules: [
    shield({
      mode: "LIVE",
    }),

    detectBot({
      mode: "LIVE",
      allow: [
        "CATEGORY:SEARCH_ENGINE",
        "GO_HTTP",
      ],
    }),
  ],
});

export async function POST(req) {
  const decision = await aj.protect(req);

  if (decision.isDenied()) {
    return NextResponse.json(
      {
        error: "Forbidden",
      },
      {
        status: 403,
      }
    );
  }

  return NextResponse.json({
    ok: true,
    message: "Request allowed by Arcjet",
  });
}