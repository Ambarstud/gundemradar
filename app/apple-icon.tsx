import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(145deg, #2563eb, #7c3aed)',
          borderRadius: 36,
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 14,
            borderRadius: 28,
            border: '3px solid rgba(255,255,255,0.25)',
          }}
        />
        <span style={{ fontSize: 72 }}>📡</span>
      </div>
    ),
    { ...size }
  );
}
