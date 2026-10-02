import type { Config } from 'tailwindcss';

// Todo color pasa por los tokens --ky-* de src/index.css (canales RGB, para que
// Tailwind aplique alfa). Cero hexadecimales en componentes.
const tono = (v: string) => `rgb(var(${v}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    screens: { sm: '640px', md: '900px', lg: '1200px', xl: '1440px' },
    extend: {
      colors: {
        fondo: { DEFAULT: tono('--ky-fondo'), 2: tono('--ky-fondo-2'), 3: tono('--ky-fondo-3') },
        hondo: tono('--ky-hondo'),
        noche: tono('--ky-noche'),
        texto: { DEFAULT: tono('--ky-texto'), 2: tono('--ky-texto-2'), 3: tono('--ky-texto-3') },
        sol: { DEFAULT: tono('--ky-sol'), hondo: tono('--ky-sol-hondo'), claro: tono('--ky-sol-claro') },
        mar: { DEFAULT: tono('--ky-mar'), texto: tono('--ky-mar-texto'), hondo: tono('--ky-mar-hondo') },
        rojo: tono('--ky-rojo'),
        verde: tono('--ky-verde'),
        aviso: tono('--ky-aviso'),
        error: tono('--ky-error'),
      },
      fontFamily: {
        display: ['Gilroy', 'system-ui', 'sans-serif'],
        sans: ['Gilroy', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: { DEFAULT: '8px', lg: '14px', xl: '22px' },
      maxWidth: { contenedor: '1320px' },
      transitionTimingFunction: { suave: 'cubic-bezier(0.22, 1, 0.36, 1)' },
      opacity: { 8: '0.08', 12: '0.12', 15: '0.15', 35: '0.35', 45: '0.45', 55: '0.55', 85: '0.85' },
    },
  },
  plugins: [],
} satisfies Config;
