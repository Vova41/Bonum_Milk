"use client";

import { useSimState } from "../hooks/useSimState";
import { useChat } from "../hooks/useChat";

// ─── Типы для кнопок ───────────────────────────────────────────────────────
type BtnVariant = "red" | "orange" | "green" | "black";

function SimBtn({
  label,
  variant = "black",
  onClick,
  disabled,
}: {
  label: string;
  variant?: BtnVariant;
  onClick: () => void;
  disabled?: boolean;
}) {
  const bg: Record<BtnVariant, string> = {
    red:    "#dc2626",
    orange: "#d97706",
    green:  "#16a34a",
    black:  "#111111",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? "#333" : bg[variant],
        color: "white",
        border: "none",
        borderRadius: "8px",
        padding: "10px 16px",
        fontWeight: 700,
        fontSize: "13px",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        width: "100%",
        textAlign: "left",
        transition: "opacity 0.15s",
      }}
    >
      {label}
    </button>
  );
}

function SimGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: "#141414",
      border: "1px solid #2a2a2a",
      borderRadius: "12px",
      padding: "18px",
    }}>
      <p style={{ color: "#666", fontSize: "11px", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "12px" }}>
        {title}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {children}
      </div>
    </div>
  );
}

export default function SimPage() {
  const { state, update, reset, currentTime } = useSimState();
  const { sendMessage } = useChat();

  // ─── Цвет и текст глобального статуса ──────────────────────────────────
  const statusColors = { ok: "#16a34a", warn: "#d97706", alert: "#dc2626" } as const;
  const statusLabels = { ok: "ОК — Норма", warn: "ВНИМАНИЕ", alert: "ТРЕВОГА" } as const;

  // ─── Хелперы ──────────────────────────────────────────────────────────
  function breakSeal(n: 1 | 2) {
    const t = currentTime();
    if (n === 1) {
      update({ seal1Broken: true, seal1BreakTime: t, seal1BreakKm: 1084, alertLevel: "alert", alertMessage: `🚨 ВСКРЫТА ПЛОМБА #1 — люк #1 · ${t} · км 1084` });
    } else {
      update({ seal2Broken: true, seal2BreakTime: t, seal2BreakKm: 1084, alertLevel: "alert", alertMessage: `🚨 ВСКРЫТА ПЛОМБА #2 — люк #2 · ${t} · км 1084` });
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "white", fontFamily: "Inter, Arial, sans-serif" }}>

      {/* ── Шапка ─────────────────────────────────────────────────────── */}
      <div style={{ background: "#111111", borderBottom: "1px solid #222", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
        <div>
          <p style={{ fontWeight: 900, fontSize: "20px", margin: 0 }}>🎬 Пульт режиссёра</p>
          <p style={{ color: "#555", fontSize: "12px", margin: "2px 0 0" }}>NeMilk · Внутренний пульт симуляции · /sim</p>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <a href="/driver"     target="_blank" style={{ color: "#888", fontSize: "12px", textDecoration: "none", padding: "6px 12px", border: "1px solid #333", borderRadius: "6px" }}>/driver ↗</a>
          <a href="/dispatcher" target="_blank" style={{ color: "#888", fontSize: "12px", textDecoration: "none", padding: "6px 12px", border: "1px solid #333", borderRadius: "6px" }}>/dispatcher ↗</a>
        </div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "24px 16px" }}>

        {/* ── Глобальный статус ────────────────────────────────────────── */}
        <div style={{
          background: statusColors[state.alertLevel],
          borderRadius: "12px",
          padding: "16px 20px",
          marginBottom: state.alertMessage ? "8px" : "24px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}>
          <span style={{ fontSize: "28px", fontWeight: 900 }}>{statusLabels[state.alertLevel]}</span>
          <span style={{ fontSize: "13px", opacity: 0.85 }}>alertLevel = &quot;{state.alertLevel}&quot;</span>
        </div>

        {/* Баннер с alertMessage */}
        {state.alertMessage && (
          <div style={{
            background: "#1a1a1a",
            border: `1px solid ${statusColors[state.alertLevel]}`,
            borderRadius: "8px",
            padding: "12px 16px",
            marginBottom: "24px",
            fontSize: "14px",
            fontWeight: 600,
            color: statusColors[state.alertLevel],
          }}>
            {state.alertMessage}
          </div>
        )}

        {/* ── Текущие значения (живая сводка) ─────────────────────────── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: "10px",
          marginBottom: "24px",
        }}>
          {[
            { label: "Температура",   value: `${state.temperatureNow.toFixed(1)}°C`, alert: state.temperatureNow >= 8 },
            { label: "Нагрев",        value: state.temperatureRising ? "ВКЛ" : "ВЫКЛ", alert: state.temperatureRising },
            { label: "Молоко",        value: `${state.milkVolume} л`,   alert: state.milkLeakDetected },
            { label: "Пломба #1",     value: state.seal1Broken ? "ВСКРЫТА" : "Цела", alert: state.seal1Broken },
            { label: "Пломба #2",     value: state.seal2Broken ? "ВСКРЫТА" : "Цела", alert: state.seal2Broken },
            { label: "Удар",          value: `${state.shockG} g`,       alert: state.shockDetected },
            { label: "GPS",           value: state.gpsLost ? "ПОТЕРЯН" : "ОК",       alert: state.gpsLost },
            { label: "Батарея",       value: `${state.batteryLevel}%`,  alert: state.batteryLow },
            { label: "Датч. уровня", value: state.levelSensorBroken ? "ОТКАЗ" : "ОК", alert: state.levelSensorBroken },
            { label: "Датч. темп.",  value: state.temperatureSensorBroken ? "ОТКАЗ" : "ОК", alert: state.temperatureSensorBroken },
          ].map((s) => (
            <div key={s.label} style={{
              background: "#141414",
              border: `1px solid ${s.alert ? "#dc2626" : "#2a2a2a"}`,
              borderRadius: "8px",
              padding: "10px 12px",
            }}>
              <p style={{ color: "#666", fontSize: "10px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "4px" }}>{s.label}</p>
              <p style={{ fontWeight: 900, fontSize: "16px", color: s.alert ? "#dc2626" : "white", margin: 0 }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* ── Кнопки управления ────────────────────────────────────────── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "16px",
        }}>

          {/* Режим */}
          <SimGroup title="Режим">
            <SimBtn label="▶ Запустить норму (сброс)" variant="green" onClick={reset} />
          </SimGroup>

          {/* Температура */}
          <SimGroup title={`Температура (сейчас: ${state.temperatureNow.toFixed(1)}°C)`}>
            <SimBtn
              label="🔥 Начать нагрев +0.2°C/сек"
              variant="red"
              disabled={state.temperatureRising}
              onClick={() => update({ temperatureRising: true })}
            />
            <SimBtn
              label="⏸ Остановить нагрев"
              variant="orange"
              disabled={!state.temperatureRising}
              onClick={() => update({ temperatureRising: false })}
            />
          </SimGroup>

          {/* Пломбы */}
          <SimGroup title="Пломбы">
            <SimBtn
              label="🔓 Вскрыть пломбу #1"
              variant="red"
              disabled={state.seal1Broken}
              onClick={() => breakSeal(1)}
            />
            <SimBtn
              label="🔓 Вскрыть пломбу #2"
              variant="red"
              disabled={state.seal2Broken}
              onClick={() => breakSeal(2)}
            />
          </SimGroup>

          {/* Молоко */}
          <SimGroup title={`Молоко (${state.milkVolume} л)`}>
            <SimBtn
              label="📉 Слив −500 л"
              variant="red"
              disabled={state.milkVolume <= 0}
              onClick={() => update({
                milkVolume:       Math.max(0, state.milkVolume - 500),
                milkLeakDetected: true,
                alertLevel:       "alert",
                alertMessage:     `🚰 СЛИВ МОЛОКА ЗАФИКСИРОВАН — осталось ${Math.max(0, state.milkVolume - 500)} л`,
              })}
            />
          </SimGroup>

          {/* Датчики */}
          <SimGroup title="Датчики (отказ)">
            <SimBtn
              label="📏 Сломать датчик уровня"
              variant="red"
              disabled={state.levelSensorBroken}
              onClick={() =>
                update({
                  levelSensorBroken: true,
                  alertLevel: state.alertLevel === "ok" ? "warn" : state.alertLevel,
                  alertMessage: state.alertMessage || "⚠ Отказ датчика уровня молока",
                })
              }
            />
            <SimBtn
              label="🌡 Сломать датчик температуры"
              variant="red"
              disabled={state.temperatureSensorBroken}
              onClick={() =>
                update({
                  temperatureSensorBroken: true,
                  alertLevel: state.alertLevel === "ok" ? "warn" : state.alertLevel,
                  alertMessage: state.alertMessage || "⚠ Отказ датчика температуры",
                })
              }
            />
          </SimGroup>

          {/* Прочее */}
          <SimGroup title="Прочее">
            <SimBtn
              label="💥 Удар 4.7g"
              variant="red"
              disabled={state.shockDetected}
              onClick={() => update({ shockDetected: true, shockG: 4.7, alertLevel: "alert", alertMessage: "💥 ЗАФИКСИРОВАН УДАР: 4.7g — возможная авария" })}
            />
            <SimBtn
              label="📡 Потеря GPS"
              variant="orange"
              disabled={state.gpsLost}
              onClick={() => update({ gpsLost: true, alertLevel: state.alertLevel === "ok" ? "warn" : state.alertLevel, alertMessage: state.alertMessage || "📡 Потерян GPS-сигнал" })}
            />
            <SimBtn
              label="🔋 Разряд батареи"
              variant="orange"
              disabled={state.batteryLow}
              onClick={() => update({ batteryLow: true, batteryLevel: 18, alertLevel: state.alertLevel === "ok" ? "warn" : state.alertLevel, alertMessage: state.alertMessage || "🔋 Низкий заряд батареи: 18%" })}
            />
          </SimGroup>

          {/* Комплексный сценарий */}
          <SimGroup title="Комплексный сценарий">
            <SimBtn
              label="🎬 Кража молока"
              variant="red"
              onClick={() => {
                const t = currentTime();
                update({
                  seal1Broken:      true,
                  seal1BreakTime:   t,
                  seal1BreakKm:     1084,
                  milkVolume:       4200,
                  milkLeakDetected: true,
                  temperatureNow:   7.8,
                  alertLevel:       "alert",
                  alertMessage:     `🚨 КРАЖА МОЛОКА: вскрыта пломба #1 (${t}, км 1084) · слив зафиксирован · осталось 4 200 л · t° = 7.8°C`,
                });
                sendMessage("dispatcher", "ТЫ ЧТО ТВОРИШЬ?!");
              }}
            />
          </SimGroup>

        </div>

        {/* ── Инструкция ──────────────────────────────────────────────── */}
        <div style={{ marginTop: "32px", padding: "16px", background: "#111", borderRadius: "10px", border: "1px solid #222" }}>
          <p style={{ color: "#555", fontSize: "12px", margin: 0, lineHeight: 1.7 }}>
            <strong style={{ color: "#666" }}>Как использовать:</strong><br />
            1. Открой <code style={{ color: "#aaa" }}>/driver</code> и <code style={{ color: "#aaa" }}>/dispatcher</code> в отдельных вкладках.<br />
            2. Нажми любую кнопку — обе вкладки обновятся мгновенно через localStorage events.<br />
            3. «Норма (сброс)» возвращает всё в исходное состояние.<br />
            Страница <code style={{ color: "#aaa" }}>/sim</code> не связана с меню — доступна только по прямой ссылке.
          </p>
        </div>
      </div>
    </div>
  );
}
