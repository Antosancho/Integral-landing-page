import sharp from 'sharp';

const SRC = 'public/brand/factor-integral-horizontal-oscuro.png';
const OUT = 'public/brand/factor-integral-horizontal-transparente.png';

const { data, info } = await sharp(SRC).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const bg = [data[0], data[1], data[2]]; // color del fondo = pixel (0,0)
const out = Buffer.alloc(info.width * info.height * 4);

for (let p = 0; p < info.width * info.height; p++) {
  const c = [data[p * 3], data[p * 3 + 1], data[p * 3 + 2]];
  let a = 0;
  for (let k = 0; k < 3; k++) {
    const d = c[k] > bg[k] ? (c[k] - bg[k]) / (255 - bg[k]) : c[k] < bg[k] ? (bg[k] - c[k]) / bg[k] : 0;
    a = Math.max(a, d);
  }
  if (a < 0.04) a = 0; // ruido de compresión alrededor del fondo
  for (let k = 0; k < 3; k++) {
    out[p * 4 + k] = a > 0 ? Math.round(Math.min(255, Math.max(0, (c[k] - bg[k]) / a + bg[k]))) : 0;
  }
  out[p * 4 + 3] = Math.round(a * 255);
}

await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toFile(OUT);
console.log(`Logo transparente generado: ${OUT}`);
