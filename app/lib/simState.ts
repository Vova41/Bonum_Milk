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
  /** Отказ датчика уровня (аппаратная часть), не путать с уровнем молока по литрам */
  levelSensorBroken: boolean;
  /** Отказ датчика температуры */
  temperatureSensorBroken: boolean;
  alertLevel: AlertLevel;
  alertMessage: string;
}

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
  levelSensorBroken: false,
  temperatureSensorBroken: false,
  alertLevel: "ok",
  alertMessage: "",
};
