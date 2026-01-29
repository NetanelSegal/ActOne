// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App";

describe("App", () => {
  beforeEach(() => {
    vi.stubGlobal("WebSocket", vi.fn(() => ({
      addEventListener: vi.fn(),
      close: vi.fn(),
      send: vi.fn(),
    })));
  });

  it("renders ActOne heading", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: /ActOne/i })).toBeInTheDocument();
  });

  it("shows API health and WebSocket placeholders", () => {
    render(<App />);
    expect(screen.getByText(/API health:/i)).toBeInTheDocument();
    expect(screen.getByText(/WebSocket:/i)).toBeInTheDocument();
  });
});
