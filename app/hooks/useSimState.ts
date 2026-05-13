"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export type AlertLevel = "ok" | "warn" | "alert";

export interface SimState {
  temperatureNow: number;
  temperatureRising: boolean;
  seal1Broken: boolean;
  seal1BreakTime: string | null;
  seal1BreakKm: number | null;
  seal2Broken: boolean;
  seal2BreakTime: string | null;
  seal2BreakKm: number | null;
  milkVolume: number;
  milkLeakDetected: boolean;
  shockDetected: boolean;
  shockG: number;
  gpsLost: boolean;
  batteryLow: boolean;
  batteryLevel: number;
  alertLevel: AlertLevel;
  alertMessage: string;
}

const STORAGE_KEY = "nemilk_sim_state";

export const DEFAULT_STATE: SimState = {
  temperatureNow: 6.4,
  temperatureRising: false,
  seal1Broken: false,
  seal1BreakTime: null,
  seal1BreakKm: null,
  seal2Broken: false,
  seal2BreakTime: null,
  seal2BreakKm: null,
  milkVolume: 5000,
  milkLeakDetected: false,
  shockDetected: false,
  shockG: 0,
  gpsLost: false,
  batteryLow: false,
  batteryLevel: 87,
  alertLevel: "ok",
  alertMessage: "",
};

function loadState(): SimState {
  if (typeof window === "undefined") {
    return DEFAULT_STATE;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_STATE;
    }

    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATE;
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

function nowHHMM(): string {
  return new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

export function useSimState() {
  const [state, setState] = useState<SimState>(() => loadState());
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
        return next;
      });
    }, 800);
  }, [stopHeating]);

  useEffect(() => {
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
      window.removeEventListener("storage", onStorage);
      stopHeating();
    };
  }, [stopHeating]);

  const update = useCallback(
    (patch: Partial<SimState>) => {
      setState((prev) => {
        const next = { ...prev, ...patch };
        dispatchState(next);
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
  }, [stopHeating]);

  return {
    state,
    update,
    reset,
    currentTime: nowHHMM,
  };
}
