// Genera los íconos a partir de assets/logo.png (fondo crema sólido).
//  - Íconos de la app (PWA, favicon): el logo con su fondo crema.
//  - Logo del menú: sin fondo (transparente), con la sombra convertida en sombra real.
import sharp from 'sharp';

const SRC = 'assets/logo.png';

// Íconos de la app: cuadrado completo con fondo crema
await sharp(SRC).resize(512, 512).png().toFile('public/icons/icon-512.png');
await sharp(SRC).resize(192, 192).png().toFile('public/icons/icon-192.png');
await sharp(SRC).resize(180, 180).png().toFile('public/icons/apple-touch-icon.png');
// Maskable: el logo más chico dentro de la zona segura
const inner = await sharp(SRC).resize(400, 400).png().toBuffer();
await sharp({ create: { width: 512, height: 512, channels: 4, background: '#fdfaf5' } })
  .composite([{ input: inner, top: 56, left: 56 }])
  .png()
  .toFile('public/icons/icon-512-maskable.png');

// Logo sin fondo: relleno desde los bordes sobre los píxeles crema/sombra (cálidos, r >= b).
// La tarjeta del logo es azulada (b > r), así que el relleno no la toca.
const { data, info } = await sharp(SRC).raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels: C } = info;
const out = Buffer.alloc(W * H * 4);
const bg = [254, 252, 247];
const lum = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
const bgLum = lum(...bg);
const isBackground = (i) => {
  const r = data[i], g = data[i + 1], b = data[i + 2];
  return b - r <= 4 && bgLum - lum(r, g, b) < 60;
};
const seen = new Uint8Array(W * H);
const stack = [];
for (let x = 0; x < W; x++) stack.push(x, (H - 1) * W + x);
for (let y = 0; y < H; y++) stack.push(y * W, y * W + W - 1);
while (stack.length) {
  const p = stack.pop();
  if (seen[p] || !isBackground(p * C)) continue;
  seen[p] = 1;
  const x = p % W, y = (p / W) | 0;
  if (x > 0) stack.push(p - 1);
  if (x < W - 1) stack.push(p + 1);
  if (y > 0) stack.push(p - W);
  if (y < H - 1) stack.push(p + W);
}
for (let p = 0; p < W * H; p++) {
  const i = p * C, o = p * 4;
  if (seen[p]) {
    // Fondo: transparente; lo más oscuro (la sombra) queda como sombra semitransparente
    const shade = Math.max(0, bgLum - lum(data[i], data[i + 1], data[i + 2]));
    out[o] = 70; out[o + 1] = 50; out[o + 2] = 30;
    out[o + 3] = Math.min(255, Math.round(shade * 4));
  } else {
    out[o] = data[i]; out[o + 1] = data[i + 1]; out[o + 2] = data[i + 2]; out[o + 3] = 255;
  }
}
const transparent = sharp(out, { raw: { width: W, height: H, channels: 4 } }).png();
const trimmed = await transparent.trim({ threshold: 1 }).toBuffer();
await sharp(trimmed).resize(160, 160, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile('public/icons/logo.png');
await sharp(trimmed).resize(64, 64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile('public/icons/favicon-64.png');
console.log('Íconos generados');
