import { simRealtimeStore } from "@/app/lib/simRealtimeStore";
import type { SimState } from "@/app/lib/simState";

export const runtime = "nodejs";

function toSsePayload(state: SimState): string {
  return `data: ${JSON.stringify(state)}\n\n`;
}

export async function GET(request: Request) {
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const encoder = new TextEncoder();

      const push = (state: SimState) => {
        controller.enqueue(encoder.encode(toSsePayload(state)));
      };

      const keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode(": ping\n\n"));
      }, 15000);

      const unsubscribe = simRealtimeStore.subscribe(push);

      const cleanup = () => {
        clearInterval(keepAlive);
        unsubscribe();
      };

      request.signal.addEventListener("abort", cleanup, { once: true });
      push(simRealtimeStore.getState());
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
