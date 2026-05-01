"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <div style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h2 style={{ color: "red", marginBottom: "1rem" }}>
        Runtime Error: {error.message}
      </h2>
      <pre style={{ background: "#f5f5f5", padding: "1rem", overflow: "auto", fontSize: "12px", whiteSpace: "pre-wrap" }}>
        {error.stack}
      </pre>
      <button
        onClick={reset}
        style={{ marginTop: "1rem", padding: "0.5rem 1rem", cursor: "pointer" }}
      >
        Try again
      </button>
    </div>
  );
}
