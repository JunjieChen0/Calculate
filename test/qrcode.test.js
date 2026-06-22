import { describe, it, expect, vi } from 'vitest';

vi.stubGlobal(
  'TextEncoder',
  class {
    encode(str) {
      return new Uint8Array([...str].map(c => c.charCodeAt(0)));
    }
  }
);

vi.stubGlobal('document', {
  createElement: tag => {
    if (tag === 'canvas') {
      return {
        width: 0,
        height: 0,
        getContext: () => ({
          fillStyle: '',
          fillRect: vi.fn()
        }),
        toDataURL: () => 'data:image/png;base64,mock'
      };
    }
    return {};
  }
});

import { generateQR, qrToDataURL } from '../renderer/modules/qrcode.js';

describe('QR Code Generator', () => {
  describe('generateQR', () => {
    it('generates QR code for simple text', () => {
      const qr = generateQR('Hello');
      expect(qr).not.toBeNull();
      expect(qr.size).toBeGreaterThan(0);
      expect(qr.modules).toBeDefined();
      expect(qr.modules.length).toBe(qr.size);
      expect(qr.modules[0].length).toBe(qr.size);
    });

    it('generates QR code for numbers', () => {
      const qr = generateQR('12345');
      expect(qr).not.toBeNull();
      expect(qr.size).toBeGreaterThan(0);
    });

    it('generates QR code for empty string returns null', () => {
      const qr = generateQR('');
      expect(qr).toBeNull();
    });

    it('generates QR code for null returns null', () => {
      const qr = generateQR(null);
      expect(qr).toBeNull();
    });

    it('generates larger QR for longer text', () => {
      const short = generateQR('Hi');
      const long = generateQR(
        'This is a much longer text that needs more data capacity in the QR code'
      );
      expect(long.size).toBeGreaterThanOrEqual(short.size);
    });

    it('QR modules contain boolean values', () => {
      const qr = generateQR('Test');
      for (const row of qr.modules) {
        for (const cell of row) {
          expect(typeof cell).toBe('boolean');
        }
      }
    });

    it('generates valid structure for single character', () => {
      const qr = generateQR('A');
      expect(qr).not.toBeNull();
      expect(qr.size).toBeGreaterThanOrEqual(21); // Minimum QR size
    });
  });

  describe('qrToDataURL', () => {
    it('generates a data URL for valid text', () => {
      const url = qrToDataURL('Hello');
      expect(url).not.toBeNull();
      expect(url).toContain('data:image/png');
    });

    it('returns null for empty text', () => {
      const url = qrToDataURL('');
      expect(url).toBeNull();
    });

    it('accepts custom module size', () => {
      const url = qrToDataURL('Test', 8, 4);
      expect(url).not.toBeNull();
    });

    it('accepts custom margin', () => {
      const url = qrToDataURL('Test', 4, 8);
      expect(url).not.toBeNull();
    });
  });
});
