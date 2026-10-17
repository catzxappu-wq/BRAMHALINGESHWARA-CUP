/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cricket: {
          dark: "#06101e",
          navy: "#0a1b33",
          navyLight: "#132d54",
          red: "#b91c1c",
          redLight: "#dc2626",
          redDark: "#7f1d1d",
          gold: "#d4af37",
          goldLight: "#f59e0b",
          goldBright: "#fbbf24",
          goldDark: "#92400e",
          green: "#15803d",
          greenDark: "#14532d",
          greenLight: "#22c55e",
        },
      },
      fontFamily: {
        kannada: ['"Noto Sans Kannada"', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        gold: '0 0 15px rgba(212, 175, 55, 0.35)',
        goldGlow: '0 0 25px rgba(245, 158, 11, 0.5)',
        redGlow: '0 0 20px rgba(220, 38, 38, 0.4)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #fbbf24 0%, #d4af37 50%, #92400e 100%)',
        'red-gradient': 'linear-gradient(135deg, #ef4444 0%, #b91c1c 50%, #7f1d1d 100%)',
        'stadium-gradient': 'linear-gradient(180deg, #050d18 0%, #0a1b33 50%, #08172c 100%)',
      },
    },
  },
  plugins: [],
};
