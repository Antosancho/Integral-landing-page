import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const out = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public/og-image.png');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#0a1826"/>
  <text x="80" y="290" font-family="Arial, Helvetica, sans-serif" font-size="108" font-weight="800" fill="#ffffff">Factor Integral</text>
  <text x="80" y="370" font-family="Arial, Helvetica, sans-serif" font-size="40" fill="#a9b8c7">Automatización con IA para comercios y pymes</text>
  <text x="80" y="450" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="700" fill="#7fb2e6">Chabás · Santa Fe</text>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile(out);
console.log(`OG image generada: ${out}`);
