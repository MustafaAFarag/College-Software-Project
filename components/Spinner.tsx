export function Spinner({ size = 14, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <>
      <style>{`@keyframes uniregSpin { to { transform: rotate(360deg); } }`}</style>
      <span
        style={{
          display: "inline-block",
          width: size,
          height: size,
          border: `2px solid ${color}30`,
          borderTopColor: color,
          borderRadius: "50%",
          animation: "uniregSpin 0.65s linear infinite",
          flexShrink: 0,
          verticalAlign: "middle",
        }}
      />
    </>
  )
}
