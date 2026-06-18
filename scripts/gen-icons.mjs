import { Jimp } from 'jimp';
import { mkdirSync } from 'fs';

mkdirSync('./public/icons', { recursive: true });

async function makeIcon(size, filename) {
  // 배경 (#1e3a5f 네이비)
  const img = new Jimp({ width: size, height: size, color: 0x1e3a5fff });

  // 흰색 원 (중앙)
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - cx, dy = y - cy;
      if (dx * dx + dy * dy <= r * r) {
        img.setPixelColor(0xf0a500ff, x, y); // 골드 원
      }
    }
  }

  await img.write(filename);
  console.log(`Created ${filename}`);
}

await makeIcon(192, './public/icons/icon-192.png');
await makeIcon(512, './public/icons/icon-512.png');
