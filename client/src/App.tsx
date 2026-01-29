import { useEffect, useState } from "react";

export default function App() {
  const [health, setHealth] = useState<{ ok?: boolean } | null>(null);
  const [wsStatus, setWsStatus] = useState<string>("disconnected");

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => setHealth(null));
  }, []);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    const ws = new WebSocket(`${protocol}//${host}/ws`);
    ws.onopen = () => setWsStatus("connected");
    ws.onclose = () => setWsStatus("disconnected");
    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data as string);
        if (msg.type === "connected") setWsStatus("connected");
      } catch {
        // ignore
      }
    };
    return () => ws.close();
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "system-ui" }}>
      <h1>ActOne</h1>
      <p>API health: {health?.ok ? "ok" : "—"}</p>
      <p>WebSocket: {wsStatus}</p>
    </div>
  );
}
