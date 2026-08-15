'use client';

export default function Spinner({ size = 40, color = '#10B981' }: { size?: number; color?: string }) {
  const bars = Array.from({ length: 12 });
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      {bars.map((_, i) => {
        const rotation = i * 30;
        const opacity = 1 - i * 0.075;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: size * 0.08,
              height: size * 0.28,
              background: color,
              borderRadius: 4,
              transform: `rotate(${rotation}deg) translate(0, -${size * 0.36}px)`,
              transformOrigin: 'center',
              opacity,
              animation: 'spinnerFade 1s linear infinite',
              animationDelay: `${-1 + i * (1 / 12)}s`,
            }}
          />
        );
      })}
      <style>{`
        @keyframes spinnerFade {
          0% { opacity: 1; }
          100% { opacity: 0.15; }
        }
      `}</style>
    </div>
  );
}
