/**
 * App palette — keep in sync with `src/styles/globals.css` :root variables.
 * Use Tailwind tokens (bg-primary, text-foreground, etc.) in JSX when possible;
 * use this object for inline styles, charts, or third-party APIs that need hex.
 */
export const Colors = {
  primary: '#808080',
  secondary: '#4A6FA5',
  accent: '#FF6B35',
  background: '#F8FAFC',
  text: '#2D3748',
  lightText: '#718096',
  white: '#ffffff',
  gray: '#E2E8F0',
  darkGray: '#4A5568',
  error: '#E53E3E',
  black: '#202020b4',
};

/** @param {string} hex - #RGB, #RRGGBB, or #RRGGBBAA */
export function hexToRgb(hex) {
  if (!hex || typeof hex !== 'string') return { r: 0, g: 0, b: 0 };
  let h = hex.replace('#', '');
  if (h.length === 8) h = h.slice(0, 6);
  if (h.length === 3) {
    h = h.split('').map((c) => c + c).join('');
  }
  const n = parseInt(h, 16);
  if (Number.isNaN(n)) return { r: 0, g: 0, b: 0 };
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

/** Precomputed RGB for canvas / non-CSS consumers */
export const colorsRgb = {
  primary: hexToRgb(Colors.primary),
  secondary: hexToRgb(Colors.secondary),
  accent: hexToRgb(Colors.accent),
};
