"use client";

import { useEffect } from "react";
import { useWsStore } from "./useWsStore";

const WS_KEEP_ALIVE_MS = 4 * 60 * 1000;

export function useWsKeepAlive() {
  const { ws, isConnected } = useWsStore();

  useEffect(() => {
    if (!ws || !isConnected || ws.readyState !== WebSocket.OPEN) return;

    const ping = () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "PING" }));
      }
    };

    const intervalId = window.setInterval(ping, WS_KEEP_ALIVE_MS);
    return () => window.clearInterval(intervalId);
  }, [ws, isConnected]);
}
