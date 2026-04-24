export function StreamingIndicator() {
  return (
    <div
      style={{
        display: "flex",
        gap: 4,
        padding: "8px 0 4px",
        alignItems: "center",
      }}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 6,
            height: 6,
            backgroundColor: "var(--text-muted)",
            borderRadius: "50%",
            display: "inline-block",
            animation: "goliath-pulse 1.4s infinite ease-in-out both",
            animationDelay: `${-0.32 + i * 0.16}s`,
          }}
        />
      ))}
    </div>
  );
}
