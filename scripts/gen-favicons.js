/* Generates the full favicon/icon set from the two master SVGs.
   Run:  node scripts/gen-favicons.js   */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const pub = path.join(__dirname, '..', 'public');
const squircle = fs.readFileSync(path.join(__dirname, 'favicon-master.svg'));
const fullbleed = fs.readFileSync(path.join(__dirname, 'favicon-fullbleed.svg'));

// Build a .ico file that embeds PNG images at the given sizes.
function buildIco(pngBuffers) {
  const count = pngBuffers.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(count, 4);

  const entries = [];
  let offset = 6 + count * 16;
  for (const { size, data } of pngBuffers) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // width
    entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
    entry.writeUInt8(0, 2); // palette
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += data.length;
    entries.push(entry);
  }
  return Buffer.concat([header, ...entries, ...pngBuffers.map((p) => p.data)]);
}

(async () => {
  // 1) SVG favicon (modern browsers) — the squircle mark.
  fs.copyFileSync(path.join(__dirname, 'favicon-master.svg'), path.join(pub, 'favicon.svg'));

  // 2) PNG favicons + multi-size .ico (legacy browsers) from the squircle.
  const icoSizes = [16, 32, 48];
  const icoBuffers = [];
  for (const size of icoSizes) {
    const data = await sharp(squircle).resize(size, size).png().toBuffer();
    icoBuffers.push({ size, data });
  }
  fs.writeFileSync(path.join(pub, 'favicon.ico'), buildIco(icoBuffers));
  await sharp(squircle).resize(32, 32).png().toFile(path.join(pub, 'favicon-32x32.png'));
  await sharp(squircle).resize(16, 16).png().toFile(path.join(pub, 'favicon-16x16.png'));

  // 3) Apple touch icon (full-bleed, no transparency — iOS masks corners).
  await sharp(fullbleed).resize(180, 180).png().toFile(path.join(pub, 'apple-touch-icon.png'));

  // 4) PWA icons (full-bleed, used as "any maskable").
  await sharp(fullbleed).resize(192, 192).png().toFile(path.join(pub, 'icon-192.png'));
  await sharp(fullbleed).resize(512, 512).png().toFile(path.join(pub, 'icon-512.png'));

  console.log('Favicons generated:');
  ['favicon.svg', 'favicon.ico', 'favicon-32x32.png', 'favicon-16x16.png', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png'].forEach((f) =>
    console.log('  public/' + f)
  );
})();
