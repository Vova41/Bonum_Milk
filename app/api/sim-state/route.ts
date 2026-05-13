import { NextResponse } from "next/server";
import { simRealtimeStore } from "@/app/lib/simRealtimeStore";
import { DEFAULT_STATE, type SimState } from "@/app/lib/simState";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(simRealtimeStore.getState());
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<SimState>;
    const next = { ...DEFAULT_STATE, ...body };
    simRealtimeStore.setState(next);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }
}
