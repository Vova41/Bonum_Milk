"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { DEFAULT_STATE, type SimState } from "../lib/simState";

export type { AlertLevel, SimState } from "../lib/simState";

const STORAGE_KEY = "nemilk_sim_state";

function readSimFromStorage(): SimState | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return null;
  }
}

function dispatchState(state: SimState): void {
  if (typeof window === "undefined") {
    return;
  }

  const newValue = JSON.stringify(state);
  localStorage.setItem(STORAGE_KEY, newValue);
  window.dispatchEvent(
    new StorageEvent("storage", {
      key: STORAGE_KEY,
      newValue,
      oldValue: null,
      storageArea: localStorage,
      url: window.location.href,
    }),
  );
}

async function syncStateToServer(state: SimState): Promise<void> {
  try {
    await fetch("/api/sim-state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state),
      keepalive: true,
    });
  } catch {
    // Keep local sync working even if network is unavailable.
  }
}

function nowHHMM(): string {
  return new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

export function useSimState() {
  // Всегда совпадает с SSR, чтобы не было hydration mismatch; реальное состояние — в useEffect.
  const [state, setState] = useState<SimState>(DEFAULT_STATE);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopHeating = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Запускаем локальный таймер нагрева только там, где включили режим.
  const startHeating = useCallback(() => {
    if (timerRef.current || typeof window === "undefined") {
      return;
    }

    timerRef.current = setInterval(() => {
      setState((prev) => {
        if (!prev.temperatureRising) {
          stopHeating();
          return prev;
        }

        const temperatureNow = Math.min(+(prev.temperatureNow + 0.2).toFixed(1), 9.5);
        let alertLevel = prev.alertLevel;
        let alertMessage = prev.alertMessage;

        if (temperatureNow >= 8.0) {
          alertLevel = "alert";
          alertMessage = `🌡 КРИТИЧЕСКАЯ ТЕМПЕРАТУРА: ${temperatureNow.toFixed(1)}°C`;
        } else if (temperatureNow >= 7.0 && prev.alertLevel === "ok") {
          alertLevel = "warn";
          alertMessage = `⚠ Температура повышена: ${temperatureNow.toFixed(1)}°C`;
        }

        const next = { ...prev, temperatureNow, alertLevel, alertMessage };
        dispatchState(next);
        void syncStateToServer(next);
        return next;
      });
    }, 800);
  }, [stopHeating]);

  useEffect(() => {
    const fromStorage = readSimFromStorage();
    if (fromStorage) {
      setState(fromStorage);
    }

    void (async () => {
      try {
        const response = await fetch("/api/sim-state", { cache: "no-store" });
        if (!response.ok) {
          return;
        }
        const data = (await response.json()) as Partial<SimState>;
        const next: SimState = { ...DEFAULT_STATE, ...data };
        setState(next);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore network bootstrap errors.
      }
    })();

    const eventSource = new EventSource("/api/sim-state/stream");
    eventSource.onmessage = (event) => {
      try {
        const next: SimState = { ...DEFAULT_STATE, ...JSON.parse(event.data) };
        setState(next);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        if (!next.temperatureRising) {
          stopHeating();
        }
      } catch {
        // Ignore malformed updates from network.
      }
    };

    function onStorage(event: StorageEvent) {
      if (event.key !== STORAGE_KEY) {
        return;
      }

      if (!event.newValue) {
        setState(DEFAULT_STATE);
        stopHeating();
        return;
      }

      try {
        const next: SimState = { ...DEFAULT_STATE, ...JSON.parse(event.newValue) };
        setState(next);

        if (!next.temperatureRising) {
          stopHeating();
        }
      } catch {
        setState(DEFAULT_STATE);
        stopHeating();
      }
    }

    window.addEventListener("storage", onStorage);

    return () => {
      eventSource.close();
      window.removeEventListener("storage", onStorage);
      stopHeating();
    };
  }, [stopHeating]);

  const update = useCallback(
    (patch: Partial<SimState>) => {
      setState((prev) => {
        const next = { ...prev, ...patch };
        dispatchState(next);
        void syncStateToServer(next);
        return next;
      });

      if (patch.temperatureRising === true) {
        startHeating();
      }

      if (patch.temperatureRising === false) {
        stopHeating();
      }
    },
    [startHeating, stopHeating],
  );

  const reset = useCallback(() => {
    stopHeating();
    setState(DEFAULT_STATE);
    dispatchState(DEFAULT_STATE);
    void syncStateToServer(DEFAULT_STATE);
  }, [stopHeating]);

  return {
    state,
    update,
    reset,
    currentTime: nowHHMM,
  };
}
