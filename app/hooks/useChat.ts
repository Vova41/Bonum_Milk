"use client";

import { useState, useEffect, useCallback } from "react";

export type ChatMessage = {
  id: string;
  from: "driver" | "dispatcher";
  text: string;
  time: string;
};

const STORAGE_KEY = "nemilk_chat";

const DEFAULT_MESSAGES: ChatMessage[] = [
  { id: "1", from: "dispatcher", text: "Доброе утро! Маршрут загружен, выезжай в 08:00.", time: "07:55" },
  { id: "2", from: "driver",     text: "Принял, выехал по графику.", time: "08:02" },
  { id: "3", from: "dispatcher", text: "На трассе М4 пробки — объедь через Батайск.", time: "10:15" },
  { id: "4", from: "driver",     text: "Понял, перестраиваюсь.", time: "10:17" },
];

function loadMessages(): ChatMessage[] {
  if (typeof window === "undefined") return DEFAULT_MESSAGES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_MESSAGES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_MESSAGES;
  } catch {
    return DEFAULT_MESSAGES;
  }
}

function saveMessages(msgs: ChatMessage[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs));
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadMessages());

  // Listen for changes from OTHER tabs
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== STORAGE_KEY) return;
      if (e.newValue === null) {
        setMessages(DEFAULT_MESSAGES);
      } else {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setMessages(parsed);
        } catch { /* ignore */ }
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const sendMessage = useCallback((from: "driver" | "dispatcher", text: string) => {
    if (!text.trim()) return;
    const now = new Date();
    const time = now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
    const msg: ChatMessage = {
      id: `${Date.now()}_${Math.random()}`,
      from,
      text: text.trim(),
      time,
    };
    setMessages((prev) => {
      const next = [...prev, msg];
      saveMessages(next);
      return next;
    });
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    }
  }, []);

  return { messages, sendMessage, clearChat };
}
