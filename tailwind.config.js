/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FCF9EE',
          100: '#F7F0D6',
          200: '#EEDDA9',
          300: '#E3C677',
          400: '#D5AE4A',
          500: '#C59A27', // Signature luxury gold
          600: '#A47A1A',
          700: '#7E5B15',
          800: '#5F4414',
          900: '#473312',
        },
        rose: {
          50: '#FDF7F8',
          100: '#FCEEF1',
          200: '#F9DCE3',
          300: '#F2BDCB',
          400: '#E792A9',
          500: '#D96987',
        },
        champagne: {
          50: '#FBF9F5',
          100: '#F7F2EA',
          200: '#EFE5D5',
          300: '#E4D3BC',
          400: '#D5BC9C',
          500: '#C29F7B',
        },
        cream: '#FAF7F2',
        ivory: '#FFFDF9',
        charcoal: '#1A1817',
        slateDark: '#121214',
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'Playfair Display', 'Georgia', 'serif'],
        display: ['var(--font-cinzel)', 'Cinzel', 'serif'],
        sans: ['var(--font-jakarta)', 'Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'luxury': '0 10px 30px -5px rgba(197, 154, 39, 0.12), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
        'soft': '0 4px 20px -2px rgba(28, 25, 23, 0.06)',
        'gold-glow': '0 0 25px rgba(213, 174, 74, 0.35)',
      },
    },
  },
  plugins: [],
};
