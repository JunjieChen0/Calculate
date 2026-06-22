/**
 * 轻量级 QR 码生成器
 * 支持 QR Version 1-10, Error Correction Level L
 * 适用于短文本（最多约 200 字符）
 */

// Galois Field arithmetic
const GF256 = (() => {
  const exp = new Uint8Array(256);
  const log = new Uint8Array(256);
  let x = 1;
  for (let i = 0; i < 255; i++) {
    exp[i] = x;
    log[x] = i;
    x = (x << 1) ^ (x >= 128 ? 0x11d : 0);
  }
  exp[255] = exp[0];
  return {
    exp,
    log,
    mul(a, b) {
      if (a === 0 || b === 0) return 0;
      return exp[(log[a] + log[b]) % 255];
    }
  };
})();

function gfPolyMul(p, q) {
  const r = new Uint8Array(p.length + q.length - 1);
  for (let i = 0; i < p.length; i++) {
    for (let j = 0; j < q.length; j++) {
      r[i + j] ^= GF256.mul(p[i], q[j]);
    }
  }
  return r;
}

function rsGeneratorPoly(nsym) {
  let g = new Uint8Array([1]);
  for (let i = 0; i < nsym; i++) g = gfPolyMul(g, new Uint8Array([1, GF256.exp[i]]));
  return g;
}

function rsEncode(data, nsym) {
  const gen = rsGeneratorPoly(nsym);
  const res = new Uint8Array(data.length + nsym);
  res.set(data);
  for (let i = 0; i < data.length; i++) {
    const coef = res[i];
    if (coef !== 0) {
      for (let j = 0; j < gen.length; j++) {
        res[i + j] ^= GF256.mul(gen[j], coef);
      }
    }
  }
  return res.slice(data.length);
}

// QR Version capacity table (EC level L)
const VERSION_TABLE = [
  null,
  { total: 26, data: 19, ec: 7, align: 0 },
  { total: 44, data: 34, ec: 10, align: 6 },
  { total: 70, data: 55, ec: 15, align: 6 },
  { total: 100, data: 80, ec: 20, align: 6 },
  { total: 134, data: 108, ec: 26, align: 6 },
  { total: 172, data: 136, ec: 18, align: 6 },
  { total: 196, data: 156, ec: 20, align: 6 },
  { total: 242, data: 194, ec: 24, align: 6 },
  { total: 292, data: 232, ec: 30, align: 6 },
  { total: 346, data: 274, ec: 32, align: 6 }
];

const ALIGN_PATTERNS = [
  null,
  [],
  [6, 18],
  [6, 22],
  [6, 26],
  [6, 30],
  [6, 34],
  [6, 22, 38],
  [6, 24, 42],
  [6, 26, 46],
  [6, 28, 50]
];

function getMinVersion(dataLen) {
  for (let v = 1; v <= 10; v++) {
    if (VERSION_TABLE[v].data >= dataLen) return v;
  }
  return -1;
}

function encodeData(text, version) {
  const cap = VERSION_TABLE[version].data;
  const bits = [];
  // Mode indicator: byte mode = 0100
  bits.push(0, 1, 0, 0);
  // Character count
  const ccBits = version <= 9 ? 8 : 16;
  const len = text.length;
  for (let i = ccBits - 1; i >= 0; i--) bits.push((len >> i) & 1);
  // Data
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    for (let j = 7; j >= 0; j--) bits.push((c >> j) & 1);
  }
  // Terminator
  for (let i = 0; i < 4 && bits.length < cap * 8; i++) bits.push(0);
  // Pad to byte
  while (bits.length % 8 !== 0) bits.push(0);
  // Pad bytes
  const padBytes = [0xec, 0x11];
  let pi = 0;
  while (bits.length < cap * 8) {
    const pb = padBytes[pi % 2];
    for (let j = 7; j >= 0; j--) bits.push((pb >> j) & 1);
    pi++;
  }
  // Convert to bytes
  const bytes = new Uint8Array(cap);
  for (let i = 0; i < cap; i++) {
    let b = 0;
    for (let j = 0; j < 8; j++) b = (b << 1) | (bits[i * 8 + j] || 0);
    bytes[i] = b;
  }
  return bytes;
}

function createMatrix(version) {
  const size = version * 4 + 17;
  const matrix = Array.from({ length: size }, () => new Int8Array(size));
  // 0=unset, 1=dark, -1=light

  function setModule(r, c, dark) {
    if (r >= 0 && r < size && c >= 0 && c < size) matrix[r][c] = dark ? 1 : -1;
  }

  // Finder patterns
  function setFinder(r0, c0) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const inOuter = r >= 0 && r <= 6 && c >= 0 && c <= 6;
        const inInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        const dark = r === -1 || r === 7 || c === -1 || c === 7 ? false : inInner ? true : !inOuter;
        if (r >= 0 && r <= 6 && c >= 0 && c <= 6) setModule(r0 + r, c0 + c, dark);
        else setModule(r0 + r, c0 + c, false);
      }
    }
  }

  setFinder(0, 0);
  setFinder(0, size - 7);
  setFinder(size - 7, 0);

  // Alignment patterns
  const ap = ALIGN_PATTERNS[version];
  if (ap) {
    for (const r of ap) {
      for (const c of ap) {
        if (matrix[r][c] !== 0) continue;
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            setModule(
              r + dr,
              c + dc,
              Math.abs(dr) === 2 || Math.abs(dc) === 2 || (dr === 0 && dc === 0)
            );
          }
        }
      }
    }
  }

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    if (matrix[6][i] === 0) setModule(6, i, i % 2 === 0);
    if (matrix[i][6] === 0) setModule(i, 6, i % 2 === 0);
  }

  // Dark module
  setModule(size - 8, 8, true);

  // Reserve format info
  for (let i = 0; i < 8; i++) {
    if (matrix[8][i] === 0) matrix[8][i] = -2; // reserved
    if (matrix[i][8] === 0) matrix[i][8] = -2;
    if (matrix[8][size - 1 - i] === 0) matrix[8][size - 1 - i] = -2;
    if (matrix[size - 1 - i][8] === 0) matrix[size - 1 - i][8] = -2;
  }
  matrix[8][8] = -2;

  return { matrix, size };
}

function placeData(matrix, size, dataBits) {
  let bitIdx = 0;
  let upward = true;

  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    const rows = upward
      ? Array.from({ length: size }, (_, i) => size - 1 - i)
      : Array.from({ length: size }, (_, i) => i);
    for (const row of rows) {
      for (let c = 0; c < 2; c++) {
        const col = right - c;
        if (col < 0 || col >= size) continue;
        if (matrix[row][col] !== 0 && matrix[row][col] !== -2) continue;
        const dark = bitIdx < dataBits.length ? dataBits[bitIdx] === 1 : false;
        matrix[row][col] = dark ? 1 : -1;
        bitIdx++;
      }
    }
    upward = !upward;
  }
}

function applyMask(matrix, size) {
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matrix[r][c] === -2) continue;
      else if ((r + c) % 2 === 0) matrix[r][c] = matrix[r][c] === 1 ? -1 : 1;
    }
  }
}

function writeFormatInfo(matrix, size) {
  // Format info for EC level L (01), mask pattern 0 (000) => data = 01000
  // BCH(15,5) encoded, then XOR with 101010000010010
  const formatBits = 0x5412; // pre-computed for L, mask 0
  for (let i = 0; i < 6; i++) matrix[8][i] = (formatBits >> (14 - i)) & 1 ? 1 : -1;
  matrix[8][7] = (formatBits >> 8) & 1 ? 1 : -1;
  matrix[8][8] = (formatBits >> 7) & 1 ? 1 : -1;
  matrix[7][8] = (formatBits >> 6) & 1 ? 1 : -1;
  for (let i = 0; i < 6; i++) matrix[5 - i][8] = (formatBits >> (5 - i)) & 1 ? 1 : -1;

  for (let i = 0; i < 8; i++) matrix[size - 1 - i][8] = (formatBits >> (14 - i)) & 1 ? 1 : -1;
  for (let i = 0; i < 7; i++) matrix[8][size - 7 + i] = (formatBits >> (6 - i)) & 1 ? 1 : -1;
}

export function generateQR(text) {
  if (!text || text.length === 0) return null;
  // Encode as UTF-8 bytes
  const encoder = new TextEncoder();
  const utf8 = encoder.encode(text);

  const version = getMinVersion(utf8.length);
  if (version < 0) return null;

  const dataBytes = encodeData(text, version);
  const ecBytes = rsEncode(dataBytes, VERSION_TABLE[version].ec);

  // Interleave data and EC
  const allBytes = new Uint8Array(dataBytes.length + ecBytes.length);
  allBytes.set(dataBytes);
  allBytes.set(ecBytes, dataBytes.length);

  // Convert to bits
  const dataBits = [];
  for (const b of allBytes) {
    for (let j = 7; j >= 0; j--) dataBits.push((b >> j) & 1);
  }

  const { matrix, size } = createMatrix(version);
  placeData(matrix, size, dataBits);
  applyMask(matrix, size);
  writeFormatInfo(matrix, size);

  // Convert to boolean grid
  return {
    size,
    modules: matrix.map(row => {
      const boolRow = [];
      for (let i = 0; i < row.length; i++) boolRow.push(row[i] === 1);
      return boolRow;
    })
  };
}

export function qrToDataURL(text, moduleSize = 4, margin = 4) {
  const qr = generateQR(text);
  if (!qr) return null;

  const totalSize = qr.size * moduleSize + margin * 2;
  const canvas = document.createElement('canvas');
  canvas.width = totalSize;
  canvas.height = totalSize;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, totalSize, totalSize);

  ctx.fillStyle = '#000000';
  for (let r = 0; r < qr.size; r++) {
    for (let c = 0; c < qr.size; c++) {
      if (qr.modules[r][c]) {
        ctx.fillRect(margin + c * moduleSize, margin + r * moduleSize, moduleSize, moduleSize);
      }
    }
  }

  return canvas.toDataURL('image/png');
}
