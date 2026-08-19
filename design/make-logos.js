// Generate 5 PNG logos (1024x1024) with no native deps.
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

const W = 1024, H = 1024;
const out = path.join(__dirname);

function crc32(buf) {
  let t = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  let crc = 0xffffffff;
  for (const b of buf) crc = (t[(crc ^ b) & 0xff] ^ (crc >>> 8)) >>> 0;
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, 'ascii');
  const c = Buffer.alloc(4); c.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, c]);
}
function writePng(file, px) {
  const raw = Buffer.alloc(H * (1 + W * 4));
  let p = 0;
  for (let y = 0; y < H; y++) {
    raw[p++] = 0;
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      raw[p++] = px[i]; raw[p++] = px[i + 1]; raw[p++] = px[i + 2]; raw[p++] = px[i + 3];
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  fs.writeFileSync(file, Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]));
}

const C = {
  bg: [6, 95, 70],
  green: [16, 185, 129],
  teal: [8, 145, 178],
  white: [255, 255, 255],
  dark: [11, 59, 46],
};

function blank(bg = C.bg) {
  const b = Buffer.alloc(W * H * 4);
  for (let i = 0; i < W * H; i++) { b[i * 4] = bg[0]; b[i * 4 + 1] = bg[1]; b[i * 4 + 2] = bg[2]; b[i * 4 + 3] = 255; }
  return b;
}
function setPx(b, x, y, c, a = 1) {
  if (x < 0 || x >= W || y < 0 || y >= H) return;
  const i = (y * W + x) * 4;
  if (a >= 1) { b[i] = c[0]; b[i + 1] = c[1]; b[i + 2] = c[2]; b[i + 3] = 255; return; }
  b[i] = Math.round(b[i] * (1 - a) + c[0] * a);
  b[i + 1] = Math.round(b[i + 1] * (1 - a) + c[1] * a);
  b[i + 2] = Math.round(b[i + 2] * (1 - a) + c[2] * a);
  b[i + 3] = 255;
}
function thickLine(b, x1, y1, x2, y2, w, c) {
  const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)) * 2;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = Math.round(x1 + (x2 - x1) * t);
    const y = Math.round(y1 + (y2 - y1) * t);
    for (let dy = -w; dy <= w; dy++)
      for (let dx = -w; dx <= w; dx++)
        if (dx * dx + dy * dy <= w * w) setPx(b, x + dx, y + dy, c);
  }
}
function ring(b, cx, cy, r1, r2, c) {
  for (let y = cy - r2; y <= cy + r2; y++)
    for (let x = cx - r2; x <= cx + r2; x++) {
      const d = Math.hypot(x - cx, y - cy);
      if (d <= r2 && d >= r1) setPx(b, x, y, c);
    }
}
function disc(b, cx, cy, r, c) {
  for (let y = cy - r; y <= cy + r; y++)
    for (let x = cx - r; x <= cx + r; x++) {
      const d = Math.hypot(x - cx, y - cy);
      if (d <= r) setPx(b, x, y, c);
    }
}
function roundedRect(b, x1, y1, x2, y2, r, c) {
  for (let y = y1; y <= y2; y++)
    for (let x = x1; x <= x2; x++) {
      const dx = Math.max(x1 + r - x, 0, x - (x2 - r));
      const dy = Math.max(y1 + r - y, 0, y - (y2 - r));
      if (dx * dx + dy * dy <= r * r) setPx(b, x, y, c);
    }
}
function rectFilled(b, x1, y1, x2, y2, c) {
  for (let y = y1; y <= y2; y++)
    for (let x = x1; x <= x2; x++) setPx(b, x, y, c);
}
function polyline(b, pts, w, c) {
  for (let i = 1; i < pts.length; i++) thickLine(b, pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], w, c);
}

// ===== L1 — Pulse P in white circle =====
function L1() {
  const b = blank();
  disc(b, 512, 512, 380, C.white);
  ring(b, 512, 512, 352, 380, C.green);
  // P
  rectFilled(b, 390, 280, 470, 720, C.bg);
  roundedRect(b, 470, 280, 620, 480, 30, C.bg);
  rectFilled(b, 480, 350, 560, 410, C.white); // bowl gap
  // pulse
  polyline(b, [[180, 620], [350, 620], [400, 560], [450, 700], [510, 490], [580, 620], [850, 620]], 16, C.green);
  return b;
}

// ===== L2 — Heartbeat wave (letterless) =====
function L2() {
  const b = blank(C.dark);
  disc(b, 512, 512, 420, [11, 59, 46]);
  polyline(b, [[120, 512], [330, 512], [400, 380], [470, 680], [540, 300], [610, 600], [680, 512], [900, 512]], 24, C.green);
  disc(b, 540, 300, 22, C.green);
  return b;
}

// ===== L3 — People + pulse =====
function L3() {
  const b = blank();
  disc(b, 512, 512, 380, C.white);
  // heads
  disc(b, 400, 420, 70, C.bg);
  disc(b, 624, 420, 70, C.bg);
  // bodies (simple arcs as rects)
  roundedRect(b, 260, 580, 540, 720, 140, C.bg);
  roundedRect(b, 484, 580, 764, 720, 140, C.bg);
  // pulse across bottom
  polyline(b, [[180, 770], [350, 770], [400, 730], [450, 820], [520, 720], [590, 770], [850, 770]], 14, C.green);
  return b;
}

// ===== L4 — Clock with P hands =====
function L4() {
  const b = blank();
  disc(b, 512, 512, 380, C.white);
  for (let i = 0; i < 12; i++) {
    const a = i * Math.PI / 6;
    const x1 = 512 + Math.cos(a) * 330, y1 = 512 + Math.sin(a) * 330;
    const x2 = 512 + Math.cos(a) * 360, y2 = 512 + Math.sin(a) * 360;
    thickLine(b, x1, y1, x2, y2, 8, C.bg);
  }
  // P (hour hand)
  rectFilled(b, 482, 300, 542, 600, C.bg);
  roundedRect(b, 542, 300, 700, 500, 30, C.bg);
  rectFilled(b, 550, 370, 660, 430, C.white);
  return b;
}

// ===== L5 — Rounded square geometric P =====
function L5() {
  const b = blank();
  roundedRect(b, 180, 180, 844, 844, 180, C.green);
  // letter P
  rectFilled(b, 370, 320, 450, 700, C.white);
  roundedRect(b, 450, 320, 660, 520, 30, C.white);
  rectFilled(b, 460, 390, 580, 450, C.green);
  // pulse dot
  disc(b, 720, 720, 40, C.white);
  disc(b, 720, 720, 22, C.green);
  return b;
}

[
  ['L1-pulse-p', L1],
  ['L2-heartbeat', L2],
  ['L3-people-pulse', L3],
  ['L4-clock-p', L4],
  ['L5-geometric-p', L5],
].forEach(([name, fn]) => writePng(path.join(out, name + '.png'), fn()));

console.log('5 logos generated in', out);
