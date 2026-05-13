"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useChat } from "../hooks/useChat";
import { useSimState } from "../hooks/useSimState";

const BonumLogo = ({ small }: { small?: boolean }) => (
  <svg width={small ? 44 : 60} height={small ? 29 : 40} viewBox="0 0 66 44" fill="none">
    <g clipPath="url(#bl_drv)">
      <path d="M8.921 20.95H2.232v-3.518h6.69v3.519zM66 15.19h-1.839c-.334 0-.668.159-.846.453l-4.011 6.72-4.012-6.72c-.178-.294-.512-.453-.846-.453h-.422a1.39 1.39 0 00-1.402 1.404V28.81h1.787a.46.46 0 00.438-.453V18.89l3.3 5.36c.245.249.511.453.845.453h.623c.334 0 .6-.204.845-.453l3.3-5.36v9.467c0 .249.2.453.445.453h1.335a.45.45 0 00.445-.453C66 23.963 66 19.577 66 15.19zm-15.388 0h-1.787a.46.46 0 00-.437.453v10.894h-6.69V15.643a.45.45 0 00-.444-.453h-1.335a.45.45 0 00-.445.453v13.159h9.766c.78 0 1.38-.611 1.38-1.404-.008-4.07-.008-8.139-.008-12.208zm-13.155 0H35.67a.46.46 0 00-.438.453v9.671l-6.266-9.67c-.2-.34-.556-.454-.846-.454h-.422c-.779 0-1.38.612-1.38 1.404V28.81h1.788a.46.46 0 00.437-.453V18.73l6.244 9.626c.2.34.556.453.846.453h.444c.78 0 1.387-.612 1.387-1.404-.007-4.077-.007-8.147-.007-12.216zm-13.156 0h-9.766c-.779 0-1.38.612-1.38 1.404v12.208h9.76c.778 0 1.379-.611 1.379-1.404.007-4.07.007-8.139.007-12.208zm-2.224 11.347h-6.69v-9.082h6.69v9.082zM0 28.81h8.81c1.29 0 2.343-1.042 2.343-2.318v-2.295c0-1.268-1.045-2.318-2.343-2.318v-.09c1.29 0 2.343-1.042 2.343-2.318v-1.978c0-1.269-1.045-2.318-2.343-2.318H.445a.45.45 0 00-.445.453V28.81zm51.962-17.365C48.292 4.628 41.18 0 33 0S17.709 4.628 14.038 11.445h2.625C20.097 5.95 26.126 2.303 33 2.303c6.874 0 12.903 3.646 16.337 9.142h2.625zM33 44c8.18 0 15.291-4.628 18.962-11.445h-2.625c-3.434 5.496-9.47 9.142-16.337 9.142-6.874 0-12.903-3.646-16.337-9.142h-2.625C17.708 39.372 24.82 44 33 44zM8.921 26.56H2.232v-3.813h6.69v3.813z" fill="white"/>
    </g>
    <defs><clipPath id="bl_drv"><path fill="white" d="M0 0h66v44H0z"/></clipPath></defs>
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

const forecasts = [
  { time: "15:00", weather: "Ясно", outside: 24, riskTemp: 7.2 },
  { time: "16:00", weather: "Ясно", outside: 26, riskTemp: 7.8 },
  { time: "17:00", weather: "Облачно", outside: 23, riskTemp: 7.6 },
  { time: "18:00", weather: "Облачно", outside: 21, riskTemp: 7.4 },
  { time: "19:00", weather: "Дождь", outside: 18, riskTemp: 7.1 },
  { time: "20:00", weather: "Дождь", outside: 16, riskTemp: 6.9 },
];

export default function DriverPage() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, clearChat } = useChat();
  const { state: sim } = useSimState();
  const bottomRef = useRef<HTMLDivElement>(null);

  // В графике меняется только последняя точка, дизайн остаётся тем же.
  const chartData = [...tempHistory.slice(0, -1), { time: "14:00", temp: sim.temperatureNow }];
  const maxTemp = Math.max(...chartData.map((item) => item.temp));
  const H = 88;

  const badgeDotColor = sim.alertLevel === "alert" ? "#dc2626" : sim.alertLevel === "warn" ? "#d97706" : "white";
  const badgeText = sim.alertLevel === "alert" ? "ТРЕВОГА" : sim.alertLevel === "warn" ? "ВНИМАНИЕ" : "В пути";
  const statusBg = sim.alertLevel === "ok" ? "#111111" : "#dc2626";
  const statusText = sim.alertLevel === "ok" ? "Нарушений не зафиксировано" : sim.alertMessage;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    sendMessage("driver", input);
    setInput("");
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f0f0f0" }}>

      {/* ── HEADER ── */}
      <header style={{ background: "#111111" }}>
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between max-w-7xl mx-auto">

          {/* Left: logo + name */}
          <div className="flex items-center gap-3">
            <Link href="/"><BonumLogo small /></Link>
            <div className="hidden sm:block w-px h-7" style={{ background: "rgba(255,255,255,0.15)" }} />
            <div className="hidden sm:block">
              <p className="text-white font-bold text-sm leading-tight">Иванов Сергей</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Водитель · Рейс #RT-2047</p>
            </div>
          </div>

          {/* Right: status + exit */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded" style={{ background: "rgba(255,255,255,0.1)" }}>
              <span className="w-1.5 h-1.5 rounded-full pulse-slow" style={{ background: badgeDotColor }} />
              <span className="text-xs font-semibold text-white">{badgeText}</span>
            </div>
            <Link href="/" className="text-xs font-medium px-2.5 py-1.5 rounded" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
              Выйти
            </Link>
          </div>
        </div>

        {/* Route strip — horizontal scroll on mobile */}
        <div style={{ background: "#1c1c1c", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="px-4 sm:px-6 py-2 max-w-7xl mx-auto overflow-x-auto">
            <div className="flex gap-4 text-xs whitespace-nowrap" style={{ color: "rgba(255,255,255,0.45)" }}>
              <span>📍 М4, км 1084</span>
              <span>🚛 87 км/ч</span>
              <span>📦 Молоко, {sim.milkVolume.toLocaleString("ru-RU")} л</span>
              <span>Ростов → Краснодар</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── CONTENT ── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-6 py-4 grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 content-start">

        {/* Security sensors */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <p className="font-bold text-sm" style={{ color: "#111111" }}>Охранные датчики</p>
            <span className="badge-ok">Норма</span>
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
                value: "Исправен",
                note: "проверка 14:00",
                valueColor: "#111111",
                noteColor: "#999999",
              },
              {
                label: "Датчик темп-ры",
                value: "Исправен",
                note: "проверка 14:00",
                valueColor: "#111111",
                noteColor: "#999999",
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

          <div className="rounded-lg px-3 py-2.5 flex items-center gap-2" style={{ background: statusBg }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
            <span className="text-xs font-medium text-white">{statusText}</span>
          </div>
        </div>

        {/* Temperature */}
        <div className="card">
          <p className="font-bold text-sm mb-3" style={{ color: "#111111" }}>Температура молока</p>

          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { label: "При заливе", value: "3.8°C", dark: true, muted: false, color: "#ffffff" },
              { label: "Сейчас", value: `${sim.temperatureNow.toFixed(1)}°C`, dark: false, muted: false, color: sim.temperatureNow >= 7.0 ? "#dc2626" : "#111111" },
              { label: "При сливе", value: "—", dark: false, muted: true, color: "#cccccc" },
            ].map((item) => (
              <div key={item.label} className="rounded-lg p-2 sm:p-3 text-center"
                style={{ background: item.dark ? "#111111" : "#f5f5f5", border: "1px solid " + (item.dark ? "#111111" : "#e0e0e0") }}>
                <p className="text-xs mb-1 leading-tight" style={{ color: item.dark ? "rgba(255,255,255,0.5)" : "#999999", fontSize: "10px" }}>{item.label}</p>
                <p className="font-black" style={{ fontSize: "clamp(14px,4vw,20px)", color: item.color }}>{item.value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-lg p-3" style={{ background: "#f5f5f5" }}>
            <p className="text-xs font-bold mb-2" style={{ color: "#999999", letterSpacing: "1px", fontSize: "10px" }}>ГРАФИК ТЕМПЕРАТУРЫ</p>
            <svg width="100%" height={H} viewBox={`0 0 ${chartData.length * 40} ${H}`} preserveAspectRatio="none">
              <defs>
                <linearGradient id="tgd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#111111" stopOpacity="0.12"/>
                  <stop offset="100%" stopColor="#111111" stopOpacity="0.01"/>
                </linearGradient>
              </defs>
              <polygon
                points={[
                  ...chartData.map((item, index) => `${index * 40 + 20},${H - ((item.temp / (maxTemp + 1)) * (H - 12) + 6)}`),
                  `${(chartData.length - 1) * 40 + 20},${H}`, `20,${H}`,
                ].join(" ")}
                fill="url(#tgd)"
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
              {chartData.map((item) => (
                <span key={item.time} style={{ color: "#aaaaaa", fontSize: "9px" }}>{item.time}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Forecast */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <p className="font-bold text-sm" style={{ color: "#111111" }}>Прогноз порчи молока</p>
            <span className="badge-ok">Норма</span>
          </div>

          <div className="rounded-lg px-3 py-2.5 mb-3 flex items-center gap-2" style={{ background: "#f5f5f5", border: "1px solid #e0e0e0" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
            <div>
              <p className="text-xs font-semibold" style={{ color: "#111111" }}>Молоко в норме 24 ч.</p>
              <p className="text-xs mt-0.5" style={{ color: "#777777" }}>Критич. темп.: 8.0°C</p>
            </div>
          </div>

          {/* Scrollable table on mobile */}
          <div className="overflow-x-auto -mx-1 rounded-lg">
            <table className="data-table w-full" style={{ minWidth: "280px" }}>
              <thead>
                <tr>
                  <th className="text-left">Время</th>
                  <th className="text-left">Погода</th>
                  <th className="text-right">Снаружи</th>
                  <th className="text-right">Молоко</th>
                </tr>
              </thead>
              <tbody>
                {forecasts.map((forecast) => (
                  <tr key={forecast.time}>
                    <td className="font-semibold" style={{ color: "#111111" }}>{forecast.time}</td>
                    <td>{forecast.weather}</td>
                    <td className="text-right">+{forecast.outside}°C</td>
                    <td className="text-right font-bold" style={{ color: "#111111" }}>{forecast.riskTemp}°C</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Chat */}
        <div className="card col-span-1 md:col-span-2 xl:col-span-3">
          <div className="flex items-center justify-between mb-3">
            <p className="font-bold text-sm" style={{ color: "#111111" }}>Связь с диспетчером</p>
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
              <div key={message.id} className={`flex ${message.from === "driver" ? "justify-end" : "justify-start"}`}>
                <div className="rounded-xl px-3 py-2 text-sm" style={{
                  maxWidth: "80%",
                  background: message.from === "driver" ? "#111111" : "#ffffff",
                  color: message.from === "driver" ? "#ffffff" : "#111111",
                  border: message.from === "driver" ? "none" : "1px solid #e0e0e0",
                }}>
                  <p className="text-xs font-semibold mb-0.5" style={{ color: message.from === "driver" ? "rgba(255,255,255,0.5)" : "#aaaaaa" }}>
                    {message.from === "driver" ? "Вы" : "Диспетчер"}
                  </p>
                  <p>{message.text}</p>
                  <p className="text-right text-xs mt-1" style={{ color: message.from === "driver" ? "rgba(255,255,255,0.35)" : "#cccccc" }}>{message.time}</p>
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
              placeholder="Сообщение диспетчеру..."
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
          <span className="text-xs text-center sm:text-left" style={{ color: "rgba(255,255,255,0.3)" }}>NeMilk · Рейс #RT-2047 · Водитель</span>
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>© 2026 BONUM</span>
        </div>
      </footer>
    </div>
  );
}
