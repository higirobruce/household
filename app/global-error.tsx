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
      <body>
        <div style={{ padding: 24, fontFamily: "system-ui" }}>
          <h1>Something went wrong</h1>
          <p style={{ color: "#666" }}>{error.message || "Unexpected error"}</p>
          <button
            onClick={reset}
            style={{
              marginTop: 16,
              padding: "8px 14px",
              borderRadius: 8,
              border: "1px solid #ccc",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
