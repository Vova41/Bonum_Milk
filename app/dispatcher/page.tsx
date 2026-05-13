"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useChat } from "../hooks/useChat";
import { useSimState } from "../hooks/useSimState";
import { DRIVER_VEHICLE_PLATE } from "../lib/driverInfo";
import { isSecuritySensorsViolated } from "../lib/simState";

const BonumLogo = ({ small }: { small?: boolean }) => (
  <svg width={small ? 44 : 60} height={small ? 29 : 40} viewBox="0 0 66 44" fill="none">
    <g clipPath="url(#bl_dsp)">
      <path d="M8.921 20.95H2.232v-3.518h6.69v3.519zM66 15.19h-1.839c-.334 0-.668.159-.846.453l-4.011 6.72-4.012-6.72c-.178-.294-.512-.453-.846-.453h-.422a1.39 1.39 0 00-1.402 1.404V28.81h1.787a.46.46 0 00.438-.453V18.89l3.3 5.36c.245.249.511.453.845.453h.623c.334 0 .6-.204.845-.453l3.3-5.36v9.467c0 .249.2.453.445.453h1.335a.45.45 0 00.445-.453C66 23.963 66 19.577 66 15.19zm-15.388 0h-1.787a.46.46 0 00-.437.453v10.894h-6.69V15.643a.45.45 0 00-.444-.453h-1.335a.45.45 0 00-.445.453v13.159h9.766c.78 0 1.38-.611 1.38-1.404-.008-4.07-.008-8.139-.008-12.208zm-13.155 0H35.67a.46.46 0 00-.438.453v9.671l-6.266-9.67c-.2-.34-.556-.454-.846-.454h-.422c-.779 0-1.38.612-1.38 1.404V28.81h1.788a.46.46 0 00.437-.453V18.73l6.244 9.626c.2.34.556.453.846.453h.444c.78 0 1.387-.612 1.387-1.404-.007-4.077-.007-8.147-.007-12.216zm-13.156 0h-9.766c-.779 0-1.38.612-1.38 1.404v12.208h9.76c.778 0 1.379-.611 1.379-1.404.007-4.07.007-8.139.007-12.208zm-2.224 11.347h-6.69v-9.082h6.69v9.082zM0 28.81h8.81c1.29 0 2.343-1.042 2.343-2.318v-2.295c0-1.268-1.045-2.318-2.343-2.318v-.09c1.29 0 2.343-1.042 2.343-2.318v-1.978c0-1.269-1.045-2.318-2.343-2.318H.445a.45.45 0 00-.445.453V28.81zm51.962-17.365C48.292 4.628 41.18 0 33 0S17.709 4.628 14.038 11.445h2.625C20.097 5.95 26.126 2.303 33 2.303c6.874 0 12.903 3.646 16.337 9.142h2.625zM33 44c8.18 0 15.291-4.628 18.962-11.445h-2.625c-3.434 5.496-9.47 9.142-16.337 9.142-6.874 0-12.903-3.646-16.337-9.142h-2.625C17.708 39.372 24.82 44 33 44zM8.921 26.56H2.232v-3.813h6.69v3.813z" fill="white"/>
    </g>
    <defs><clipPath id="bl_dsp"><path fill="white" d="M0 0h66v44H0z"/></clipPath></defs>
  </svg>
);

const tempHistory = [
  { time: "08:00", temp: 4.1 },
  { time: "09:00", temp: 4.3 },
  { time: "10:00", temp: 4.8 },
  { time: "11:00", temp: 5.2 },
  { time: "12:00", temp: 5.7 },
  { time: "13:00", temp: 6.1 },
  { time: "14:00", temp: 6.4 },
];

export default function DispatcherPage() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, clearChat } = useChat();
  const { state: sim } = useSimState();
  const bottomRef = useRef<HTMLDivElement>(null);
  const chartData = [...tempHistory.slice(0, -1), { time: "14:00", temp: sim.temperatureNow }];
  const maxTemp = Math.max(...chartData.map((item) => item.temp));
  const H = 88;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    sendMessage("dispatcher", input);
    setInput("");
  }

  function downloadReport() {
    const incidents: string[] = [];

    if (sim.temperatureNow >= 7.0) {
      incidents.push(`  Температура повышена: ${sim.temperatureNow.toFixed(1)}°C`);
    }
    if (sim.seal1Broken) {
      incidents.push(`  Пломба #1 вскрыта: ${sim.seal1BreakTime} · км ${sim.seal1BreakKm}`);
    }
    if (sim.seal2Broken) {
      incidents.push(`  Пломба #2 вскрыта: ${sim.seal2BreakTime} · км ${sim.seal2BreakKm}`);
    }
    if (sim.milkLeakDetected) {
      incidents.push(`  Слив молока: осталось ${sim.milkVolume.toLocaleString("ru-RU")} л`);
    }
    if (sim.shockDetected) {
      incidents.push(`  Удар: ${sim.shockG} g`);
    }
    if (sim.gpsLost) {
      incidents.push("  Потеря GPS-сигнала");
    }
    if (sim.batteryLow) {
      incidents.push(`  Низкий заряд батареи: ${sim.batteryLevel}%`);
    }
    if (sim.levelSensorBroken) {
      incidents.push("  Отказ датчика уровня молока");
    }
    if (sim.temperatureSensorBroken) {
      incidents.push("  Отказ датчика температуры");
    }

    const lines = [
      "════════════════════════════",
      "  ОТЧЁТ О РЕЙСЕ #RT-2047",
      "════════════════════════════",
      `Дата: ${new Date().toLocaleDateString("ru-RU")}`,
      "Водитель: Иванов Сергей",
      `ТС: ${DRIVER_VEHICLE_PLATE}`,
      "Маршрут: Ростов-на-Дону → Краснодар",
      "",
      "── ТЕМПЕРАТУРА ──",
      "При заливе: 3.8°C",
      ...chartData.map((item) => `  ${item.time} → ${item.temp.toFixed(1)}°C`),
      "При сливе: —",
      "",
      "── ПЛОМБЫ ──",
      sim.seal1Broken ? `  Люк #1: ВСКРЫТА (${sim.seal1BreakTime} · км ${sim.seal1BreakKm})` : "  Люк #1: ЦЕЛА (0x4A2F) с 08:00",
      sim.seal2Broken ? `  Люк #2: ВСКРЫТА (${sim.seal2BreakTime} · км ${sim.seal2BreakKm})` : "  Люк #2: ЦЕЛА (0x8B3C) с 08:00",
      "",
      "── ОХРАННЫЕ ДАТЧИКИ ──",
      `  Уровень молока: ${sim.milkVolume.toLocaleString("ru-RU")} л — ${sim.milkLeakDetected ? "Слив зафиксирован" : "Норма"}`,
      `  Удар: ${sim.shockG} g, Крен: 1.2°, Торможение: 0.3g`,
      `  Датчик уровня: ${sim.levelSensorBroken ? "ОТКАЗ" : "исправен"}`,
      `  Датчик температуры: ${sim.temperatureSensorBroken ? "ОТКАЗ" : "исправен"}`,
      ...(incidents.length > 0 ? ["", "── ЗАФИКСИРОВАННЫЕ ИНЦИДЕНТЫ ──", ...incidents] : []),
      "",
      "── ПЕРЕПИСКА ──",
      ...messages.map((message) => `  [${message.time}] ${message.from === "driver" ? "Водитель  " : "Диспетчер"}: ${message.text}`),
      "",
      "NeMilk v1.0.0 · BONUM",
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "NeMilk_RT-2047.txt";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f0f0f0" }}>

      {/* ── HEADER ── */}
      <header style={{ background: "#111111" }}>
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between max-w-7xl mx-auto">

          {/* Left */}
          <div className="flex items-center gap-3">
            <Link href="/"><BonumLogo small /></Link>
            <div className="hidden sm:block w-px h-7" style={{ background: "rgba(255,255,255,0.15)" }} />
            <div className="hidden sm:block">
              <p className="text-white font-bold text-sm leading-tight">Петрова Анна</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Диспетчер · Смена 2</p>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            <button onClick={downloadReport} className="hidden sm:flex items-center gap-2 px-3 py-2 rounded text-sm font-bold text-black" style={{ background: "#ffffff" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Отчёт
            </button>
            <button onClick={downloadReport} className="sm:hidden flex items-center justify-center w-9 h-9 rounded" style={{ background: "#ffffff" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2.5">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </button>
            <Link href="/" className="text-xs font-medium px-2.5 py-1.5 rounded" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
              Выйти
            </Link>
          </div>
        </div>

        {/* Route strip */}
        <div style={{ background: "#1c1c1c", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="px-4 sm:px-6 py-2 max-w-7xl mx-auto overflow-x-auto">
            <div className="flex gap-4 text-xs whitespace-nowrap" style={{ color: "rgba(255,255,255,0.45)" }}>
              <span>🚛 Иванов Сергей · {DRIVER_VEHICLE_PLATE} · Рейс #RT-2047</span>
              <span>📍 М4, км 1084</span>
              <span>⚡ 87 км/ч</span>
              <span className="font-medium text-white">Прибытие ~16:45</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── CONTENT ── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-6 py-4 grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 content-start">

        {/* Map */}
        <div className="card col-span-1 md:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <p className="font-bold text-sm" style={{ color: "#111111" }}>Местоположение водителя</p>
            <span className="text-xs px-2.5 py-1 rounded" style={{ background: "#f5f5f5", color: "#777777" }}>14:32</span>
          </div>

          {sim.gpsLost && (
            <div
              className="mb-3 rounded-lg px-3 py-2.5 text-xs font-semibold flex items-center gap-2"
              style={{ background: "#fef3c7", border: "1px solid #d97706", color: "#92400e" }}
            >
              <span aria-hidden>📡</span>
              <span>GPS-сигнал потерян. Местоположение водителя на карте не обновляется до восстановления связи.</span>
            </div>
          )}

          <div className="relative rounded-xl overflow-hidden mb-3" style={{ height: "180px", background: "#1a1a1a" }}>
            <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
              <defs>
                <pattern id="mg" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#mg)"/>
              <line x1="0" y1="95" x2="100%" y2="95" stroke="rgba(255,255,255,0.12)" strokeWidth="9"/>
              <line x1="0" y1="95" x2="100%" y2="95" stroke="rgba(255,255,255,0.05)" strokeWidth="2" strokeDasharray="12,6"/>
              <line x1="200" y1="0" x2="200" y2="100%" stroke="rgba(255,255,255,0.06)" strokeWidth="5"/>
              <polyline points="25,160 95,140 195,115 305,97 415,90 520,80 600,70"
                fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeDasharray="8,5" strokeLinecap="round"/>
              <circle cx="415" cy="90" r="13" fill="rgba(255,255,255,0.1)"/>
              <circle cx="415" cy="90" r="7" fill={sim.gpsLost ? "#9ca3af" : "white"}/>
              <circle cx="415" cy="90" r="3" fill="#111111"/>
              <circle cx="25" cy="160" r="5" fill="rgba(255,255,255,0.6)"/>
              <circle cx="600" cy="70" r="5" fill="rgba(255,255,255,0.35)"/>
              <text x="34" y="164" fill="rgba(255,255,255,0.4)" fontSize="10">Ростов</text>
              <text x="604" y="74" fill="rgba(255,255,255,0.4)" fontSize="10">Краснодар</text>
            </svg>
            <div className="absolute top-2 left-2 text-xs px-2.5 py-1 rounded" style={{ background: "rgba(0,0,0,0.6)", color: "rgba(255,255,255,0.7)" }}>87 км/ч</div>
            <div className="absolute top-2 right-2 text-xs px-2.5 py-1 rounded font-medium" style={{ background: "white", color: "#111111" }}>М4, км 1084</div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Пройдено", value: "312 км" },
              { label: "Осталось", value: "184 км" },
              { label: "Прибытие", value: "~16:45" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-lg p-2.5 sm:p-3 text-center" style={{ background: "#f5f5f5" }}>
                <p className="text-xs mb-1" style={{ color: "#999999", fontSize: "10px" }}>{stat.label}</p>
                <p className="font-bold text-sm" style={{ color: "#111111" }}>{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Seals */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <p className="font-bold text-sm" style={{ color: "#111111" }}>Состояние пломб</p>
            {sim.seal1Broken || sim.seal2Broken ? (
              <span
                className="text-[11px] font-bold px-2.5 py-0.5 rounded-full tracking-wide"
                style={{ background: "#fee2e2", color: "#b91c1c", border: "1px solid #fecaca" }}
              >
                Нарушена
              </span>
            ) : (
              <span className="badge-ok">Целы</span>
            )}
          </div>

          {[
            {
              id: 1,
              code: "0x4A2F",
              since: sim.seal1Broken ? sim.seal1BreakTime : "08:00",
              km: sim.seal1Broken ? sim.seal1BreakKm : 0,
              broken: sim.seal1Broken,
            },
            {
              id: 2,
              code: "0x8B3C",
              since: sim.seal2Broken ? sim.seal2BreakTime : "08:00",
              km: sim.seal2Broken ? sim.seal2BreakKm : 0,
              broken: sim.seal2Broken,
            },
          ].map((seal) => (
            <div key={seal.id} className="rounded-xl p-3 sm:p-4 mb-3"
              style={{ background: "#f5f5f5", border: "1px solid #e0e0e0" }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded flex items-center justify-center font-bold text-sm text-white shrink-0" style={{ background: "#111111" }}>
                    {seal.id}
                  </div>
                  <span className="font-semibold text-sm" style={{ color: "#111111" }}>Люк #{seal.id}</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  <span className="text-xs font-bold" style={{ color: seal.broken ? "#dc2626" : "#111111" }}>{seal.broken ? "ВСКРЫТА" : "Цела"}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p style={{ color: "#999999" }}>Код пломбы</p>
                  <p className="font-mono font-bold mt-0.5" style={{ color: "#111111" }}>{seal.code}</p>
                </div>
                <div>
                  <p style={{ color: "#999999" }}>{seal.broken ? "Вскрытие" : "Опломбировано"}</p>
                  <p className="font-semibold mt-0.5" style={{ color: seal.broken ? "#dc2626" : "#111111" }}>{seal.since} · км {seal.km}</p>
                </div>
              </div>
            </div>
          ))}

          {(sim.seal1Broken || sim.seal2Broken) && (
            <div className="rounded-lg px-3 py-2.5 mb-3 flex items-center gap-2" style={{ background: "#f5f5f5", border: "1px solid #e0e0e0" }}>
              <span className="text-xs font-medium" style={{ color: "#dc2626" }}>
                {sim.seal1Broken && `Пломба #1: ${sim.seal1BreakTime} · км ${sim.seal1BreakKm}`}
                {sim.seal1Broken && sim.seal2Broken && " · "}
                {sim.seal2Broken && `Пломба #2: ${sim.seal2BreakTime} · км ${sim.seal2BreakKm}`}
              </span>
            </div>
          )}

          <div
            className="rounded-lg px-3 py-2.5 flex items-center gap-2"
            style={{ background: sim.seal1Broken || sim.seal2Broken ? "#dc2626" : "#111111" }}
          >
            {sim.seal1Broken || sim.seal2Broken ? (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            ) : (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
            )}
            <p className="text-xs font-medium text-white">
              {sim.seal1Broken || sim.seal2Broken
                ? "Целостность груза нарушена — зафиксировано вскрытие пломбы"
                : "Целостность груза подтверждена"}
            </p>
          </div>
        </div>

        {/* Temperature */}
        <div className="card">
          <p className="font-bold text-sm mb-3" style={{ color: "#111111" }}>Температура молока</p>

          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { label: "При заливе", value: "3.8°C", dark: true, color: "#ffffff" },
              {
                label: "Сейчас",
                value: sim.temperatureSensorBroken ? "—" : `${sim.temperatureNow.toFixed(1)}°C`,
                dark: false,
                color: sim.temperatureSensorBroken ? "#999999" : sim.temperatureNow >= 7.0 ? "#dc2626" : "#111111",
              },
              { label: "При сливе", value: "—", dark: false, color: "#cccccc" },
            ].map((item) => (
              <div key={item.label} className="rounded-lg p-2 sm:p-3 text-center"
                style={{ background: item.dark ? "#111111" : "#f5f5f5", border: "1px solid " + (item.dark ? "#111111" : "#e0e0e0") }}>
                <p style={{ color: item.dark ? "rgba(255,255,255,0.5)" : "#999999", fontSize: "10px" }} className="mb-1 leading-tight">{item.label}</p>
                <p className="font-black" style={{ fontSize: "clamp(14px,4vw,20px)", color: item.color }}>{item.value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-lg p-3" style={{ background: "#f5f5f5" }}>
            <p style={{ color: "#999999", fontSize: "10px", letterSpacing: "1px" }} className="font-bold mb-2">ГРАФИК ТЕМПЕРАТУРЫ</p>
            <svg width="100%" height={H} viewBox={`0 0 ${chartData.length * 40} ${H}`} preserveAspectRatio="none">
              <defs>
                <linearGradient id="tgdp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#111111" stopOpacity="0.12"/>
                  <stop offset="100%" stopColor="#111111" stopOpacity="0.01"/>
                </linearGradient>
              </defs>
              <polygon
                points={[
                  ...chartData.map((item, index) => `${index * 40 + 20},${H - ((item.temp / (maxTemp + 1)) * (H - 12) + 6)}`),
                  `${(chartData.length - 1) * 40 + 20},${H}`, `20,${H}`,
                ].join(" ")}
                fill="url(#tgdp)"
              />
              <polyline
                points={chartData.map((item, index) => `${index * 40 + 20},${H - ((item.temp / (maxTemp + 1)) * (H - 12) + 6)}`).join(" ")}
                fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              />
              {chartData.map((item, index) => (
                <circle key={item.time + index} cx={index * 40 + 20} cy={H - ((item.temp / (maxTemp + 1)) * (H - 12) + 6)} r="3.5" fill="white" stroke="#111111" strokeWidth="2"/>
              ))}
            </svg>
            <div className="flex justify-between mt-1">
              {chartData.map((item) => (<span key={item.time} style={{ color: "#aaaaaa", fontSize: "9px" }}>{item.time}</span>))}
            </div>
          </div>
        </div>

        {/* Security sensors */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <p className="font-bold text-sm" style={{ color: "#111111" }}>Охранные датчики</p>
            {isSecuritySensorsViolated(sim) ? (
              <span
                className="text-[11px] font-bold px-2.5 py-0.5 rounded-full tracking-wide"
                style={{ background: "#fee2e2", color: "#b91c1c", border: "1px solid #fecaca" }}
              >
                Нарушен
              </span>
            ) : (
              <span className="badge-ok">Норма</span>
            )}
          </div>

          <div className="flex flex-col gap-2 mb-3">
            {[
              {
                label: "Уровень молока",
                value: `${sim.milkVolume.toLocaleString("ru-RU")} л`,
                note: sim.milkLeakDetected ? "Слив зафиксирован!" : "Слив не зафиксирован",
                valueColor: "#111111",
                noteColor: sim.milkLeakDetected ? "#dc2626" : "#999999",
              },
              {
                label: "Пломба люк #1",
                value: sim.seal1Broken ? "ВСКРЫТА" : "Цела",
                note: sim.seal1Broken ? `вскрыта в ${sim.seal1BreakTime} · км ${sim.seal1BreakKm}` : "0x4A2F · км 0 · 08:00",
                valueColor: sim.seal1Broken ? "#dc2626" : "#111111",
                noteColor: sim.seal1Broken ? "#dc2626" : "#999999",
              },
              {
                label: "Пломба люк #2",
                value: sim.seal2Broken ? "ВСКРЫТА" : "Цела",
                note: sim.seal2Broken ? `вскрыта в ${sim.seal2BreakTime} · км ${sim.seal2BreakKm}` : "0x8B3C · км 0 · 08:00",
                valueColor: sim.seal2Broken ? "#dc2626" : "#111111",
                noteColor: sim.seal2Broken ? "#dc2626" : "#999999",
              },
              {
                label: "Датчик уровня",
                value: sim.levelSensorBroken ? "ОТКАЗ" : "Исправен",
                note: sim.levelSensorBroken ? "Нет достоверных данных с датчика" : "проверка 14:00",
                valueColor: sim.levelSensorBroken ? "#dc2626" : "#111111",
                noteColor: sim.levelSensorBroken ? "#dc2626" : "#999999",
              },
              {
                label: "Датчик темп-ры",
                value: sim.temperatureSensorBroken ? "ОТКАЗ" : "Исправен",
                note: sim.temperatureSensorBroken ? "Показания недостоверны" : "проверка 14:00",
                valueColor: sim.temperatureSensorBroken ? "#dc2626" : "#111111",
                noteColor: sim.temperatureSensorBroken ? "#dc2626" : "#999999",
              },
              {
                label: "Удар / авария",
                value: `${sim.shockG} g`,
                note: "порог: 3 g",
                valueColor: sim.shockDetected ? "#dc2626" : "#111111",
                noteColor: "#999999",
              },
            ].map((sensor) => (
              <div key={sensor.label} className="rounded-lg px-3 py-2.5 flex items-center justify-between"
                style={{ background: "#f5f5f5", border: "1px solid #e0e0e0" }}>
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate" style={{ color: "#111111" }}>{sensor.label}</p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: sensor.noteColor }}>{sensor.note}</p>
                </div>
                <span className="text-sm font-bold ml-2 shrink-0" style={{ color: sensor.valueColor }}>{sensor.value}</span>
              </div>
            ))}
          </div>

          <div className="rounded-lg px-3 py-2.5 flex items-center gap-2" style={{ background: sim.alertLevel === "ok" ? "#111111" : "#dc2626" }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
            <span className="text-xs font-medium text-white">{sim.alertLevel === "ok" ? "Нарушений не зафиксировано" : sim.alertMessage}</span>
          </div>
        </div>

        {/* Chat */}
        <div className="card col-span-1 md:col-span-2 xl:col-span-3">
          <div className="flex items-center justify-between mb-3">
            <p className="font-bold text-sm" style={{ color: "#111111" }}>Связь с водителем</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full pulse-slow" style={{ background: "#111111" }} />
                <span className="text-xs font-medium" style={{ color: "#555555" }}>Онлайн</span>
              </div>
              <button
                onClick={clearChat}
                className="text-xs px-2.5 py-1.5 rounded font-medium"
                style={{ background: "#f5f5f5", border: "1px solid #e0e0e0", color: "#999999" }}
              >
                Очистить
              </button>
            </div>
          </div>

          <div className="rounded-lg p-3 h-48 sm:h-56 overflow-y-auto flex flex-col gap-2.5 mb-3" style={{ background: "#f5f5f5" }}>
            {messages.length === 0 && (
              <p className="text-xs text-center m-auto" style={{ color: "#bbbbbb" }}>Сообщений нет</p>
            )}
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.from === "dispatcher" ? "justify-end" : "justify-start"}`}>
                <div className="rounded-xl px-3 py-2 text-sm" style={{
                  maxWidth: "80%",
                  background: message.from === "dispatcher" ? "#111111" : "#ffffff",
                  color: message.from === "dispatcher" ? "#ffffff" : "#111111",
                  border: message.from === "dispatcher" ? "none" : "1px solid #e0e0e0",
                }}>
                  <p className="text-xs font-semibold mb-0.5" style={{ color: message.from === "dispatcher" ? "rgba(255,255,255,0.5)" : "#aaaaaa" }}>
                    {message.from === "dispatcher" ? "Вы" : "Водитель"}
                  </p>
                  <p>{message.text}</p>
                  <p className="text-right text-xs mt-1" style={{ color: message.from === "dispatcher" ? "rgba(255,255,255,0.35)" : "#cccccc" }}>{message.time}</p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="flex gap-2">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && handleSend()}
              placeholder="Сообщение водителю..."
              className="flex-1 rounded-lg px-3 py-2.5 text-sm outline-none"
              style={{ background: "#f5f5f5", border: "1px solid #e0e0e0", color: "#111111", minWidth: 0 }}
            />
            <button onClick={handleSend} className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm text-white" style={{ background: "#111111" }}>
              Отправить
            </button>
            <button onClick={handleSend} className="sm:hidden flex items-center justify-center w-11 h-11 rounded-lg shrink-0" style={{ background: "#111111" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer style={{ background: "#111111" }}>
        <div className="px-4 sm:px-6 py-3 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1">
          <span className="text-xs text-center sm:text-left" style={{ color: "rgba(255,255,255,0.3)" }}>NeMilk · Рейс #RT-2047 · Диспетчер</span>
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>© 2026 BONUM</span>
        </div>
      </footer>
    </div>
  );
}
