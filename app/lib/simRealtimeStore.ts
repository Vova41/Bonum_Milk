import { EventEmitter } from "node:events";
import { DEFAULT_STATE, type SimState } from "./simState";

class SimRealtimeStore {
  private readonly events = new EventEmitter();
  private state: SimState = DEFAULT_STATE;

  getState(): SimState {
    return this.state;
  }

  setState(next: SimState): void {
    this.state = { ...DEFAULT_STATE, ...next };
    this.events.emit("change", this.state);
  }

  subscribe(listener: (state: SimState) => void): () => void {
    this.events.on("change", listener);
    return () => this.events.off("change", listener);
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __nemilkSimStore: SimRealtimeStore | undefined;
}

export const simRealtimeStore = globalThis.__nemilkSimStore ?? new SimRealtimeStore();

if (!globalThis.__nemilkSimStore) {
  globalThis.__nemilkSimStore = simRealtimeStore;
}
