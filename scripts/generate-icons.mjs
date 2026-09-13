/**
 * Generate favicon + PWA icons from the Touch Radio wordmark wave.
 * Run: node scripts/generate-icons.mjs
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = (...parts) => join(root, "public", ...parts);

/** Full-bleed app icon — content stays in ~80% safe zone for maskable. */
function appIconSvg({ size, padRatio = 0.12, strokeScale = 1, showDot = true }) {
  const pad = size * padRatio;
  const inner = size - pad * 2;
  const s = inner / 48;
  const t = (x, y) => [pad + x * s, pad + y * s];
  const sw = (w) => Math.max(2, w * s * strokeScale);

  const [cx, cy] = t(24, 24);
  const lines = [
    [12, 21, 12, 27, 2.5],
    [18, 16, 18, 32, 2.5],
    [24, 11, 24, 37, 3],
    [30, 17, 30, 31, 2.5],
    [36, 22, 36, 26, 2.5],
  ];

  const lineEls = lines
    .map(([x1, y1, x2, y2, w]) => {
      const [a, b] = t(x1, y1);
      const [c, d] = t(x2, y2);
      return `<line x1="${a}" y1="${b}" x2="${c}" y2="${d}" stroke="url(#g)" stroke-width="${sw(w)}" stroke-linecap="round"/>`;
    })
    .join("");

  const dot = showDot
    ? `<circle cx="${cx}" cy="${cy}" r="${Math.max(2, 2.5 * s)}" fill="#FFFFFF"/>`
    : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none">
  <defs>
    <linearGradient id="g" x1="${pad}" y1="${pad}" x2="${size - pad}" y2="${size - pad}" gradientUnits="userSpaceOnUse">
      <stop stop-color="#00E5FF"/>
      <stop offset="0.5" stop-color="#3B82F6"/>
      <stop offset="1" stop-color="#8B5CF6"/>
    </linearGradient>
    <radialGradient id="glow" cx="${cx}" cy="${cy}" r="${16 * s}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#00E5FF" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="#00E5FF" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="#141721"/>
  <circle cx="${cx}" cy="${cy}" r="${16 * s}" fill="url(#glow)"/>
  ${lineEls}
  ${dot}
</svg>`;
}

/** Pack PNGs into a multi-size ICO (PNG-compressed entries). */
function pngsToIco(pngBuffers) {
  const count = pngBuffers.length;
  const headerSize = 6 + count * 16;
  let offset = headerSize;
  const entries = [];

  for (const png of pngBuffers) {
    const meta = pngMeta(png);
    entries.push({ width: meta.width, height: meta.height, png, offset });
    offset += png.length;
  }

  const buf = Buffer.alloc(offset);
  buf.writeUInt16LE(0, 0);
  buf.writeUInt16LE(1, 2);
  buf.writeUInt16LE(count, 4);

  entries.forEach((e, i) => {
    const o = 6 + i * 16;
    buf.writeUInt8(e.width >= 256 ? 0 : e.width, o);
    buf.writeUInt8(e.height >= 256 ? 0 : e.height, o + 1);
    buf.writeUInt8(0, o + 2);
    buf.writeUInt8(0, o + 3);
    buf.writeUInt16LE(1, o + 4);
    buf.writeUInt16LE(32, o + 6);
    buf.writeUInt32LE(e.png.length, o + 8);
    buf.writeUInt32LE(e.offset, o + 12);
    e.png.copy(buf, e.offset);
  });

  return buf;
}

function pngMeta(png) {
  // IHDR after 8-byte signature
  return { width: png.readUInt32BE(16), height: png.readUInt32BE(20) };
}

async function renderPng(svg, size) {
  return sharp(Buffer.from(svg))
    .resize(size, size, { fit: "fill" })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
}

async function main() {
  mkdirSync(out("icons"), { recursive: true });

  const largeSvg = appIconSvg({ size: 1024, padRatio: 0.14, showDot: true });
  const smallSvg = appIconSvg({
    size: 256,
    padRatio: 0.12,
    strokeScale: 1.15,
    showDot: false,
  });

  writeFileSync(out("favicon.svg"), appIconSvg({ size: 64, padRatio: 0.12, strokeScale: 1.2, showDot: false }));

  const sizes = [
    { file: "favicon-32x32.png", size: 32, small: true },
    { file: "apple-touch-icon.png", size: 180, small: false },
    { file: join("icons", "icon-192.png"), size: 192, small: false },
    { file: join("icons", "icon-512.png"), size: 512, small: false },
  ];

  const rendered = {};
  for (const item of sizes) {
    const svg = item.small ? smallSvg : largeSvg;
    const png = await renderPng(svg, item.size);
    writeFileSync(out(item.file), png);
    rendered[item.size] = png;
    console.log(`wrote public/${item.file} (${png.length} bytes)`);
  }

  const ico16 = await renderPng(smallSvg, 16);
  const ico32 = rendered[32];
  const ico48 = await renderPng(smallSvg, 48);
  const ico = pngsToIco([ico16, ico32, ico48]);
  writeFileSync(out("favicon.ico"), ico);
  console.log(`wrote public/favicon.ico (${ico.length} bytes)`);

  // Also keep a high-res source for future use
  writeFileSync(out("icons", "icon-source.svg"), largeSvg);
  console.log("done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
