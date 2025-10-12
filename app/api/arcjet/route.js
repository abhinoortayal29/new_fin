// app/api/arcjet/route.js  (server-side - not an edge)
import { NextResponse } from "next/server";
import arcjet from "@arcjet/next"; // safe to import on server

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    // same rules you used previously
  ],
});

export async function POST(req) {
  // Example: forward request info to Arcjet and return result
  // (Implement based on arcjet server API)
  // This is a placeholder — use arcjet docs to call detection APIs inside server.
  const body = await req.json();
  const result = await aj.analyze?.(body) ?? { ok: true }; // replace with real API
  return NextResponse.json(result);
}
