/**
 * PWA ikonları üretir — `node scripts/generate-icons.mjs`
 */
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { ImageResponse } from 'next/og.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

function iconElement(size) {
  const emojiSize = Math.round(size * 0.38);
  const ring = Math.round(size * 0.08);
  return React.createElement(
    'div',
    {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(145deg, #2563eb 0%, #7c3aed 55%, #4f46e5 100%)',
        borderRadius: Math.round(size * 0.22),
        position: 'relative',
      },
    },
    React.createElement('div', {
      style: {
        position: 'absolute',
        inset: ring,
        borderRadius: Math.round(size * 0.18),
        border: `${Math.max(2, Math.round(size * 0.018))}px solid rgba(255,255,255,0.25)`,
      },
    }),
    React.createElement('div', {
      style: {
        position: 'absolute',
        width: size * 0.55,
        height: size * 0.55,
        borderRadius: '50%',
        border: `${Math.max(2, Math.round(size * 0.014))}px dashed rgba(255,255,255,0.2)`,
      },
    }),
    React.createElement('span', { style: { fontSize: emojiSize, lineHeight: 1 } }, '📡')
  );
}

async function generate(size) {
  const res = new ImageResponse(iconElement(size), { width: size, height: size });
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(join(publicDir, `icon-${size}.png`), buf);
  console.log(`✓ icon-${size}.png`);
}

await generate(192);
await generate(512);
