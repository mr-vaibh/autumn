"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body style={{ margin: 0, fontFamily: "monospace", background: "#fff", padding: "2rem" }}>
        <h2 style={{ color: "red" }}>Error: {error.message}</h2>
        <pre style={{ background: "#f5f5f5", padding: "1rem", overflow: "auto", fontSize: "12px" }}>
          {error.stack}
        </pre>
        <button onClick={reset} style={{ marginTop: "1rem", padding: "0.5rem 1rem", cursor: "pointer" }}>
          Try again
        </button>
      </body>
    </html>
  );
}
