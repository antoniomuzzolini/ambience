/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
      },
      colors: {
        medieval: {
          parchment: {
            DEFAULT: '#f4e8d0',
            dark: '#e8d7b8',
          },
          brown: {
            light: '#8b5a3c',
            DEFAULT: '#6b4226',
            dark: '#4a2c1a',
          },
          gold: {
            DEFAULT: '#d4af37',
            dark: '#b8941f',
          },
          burgundy: {
            DEFAULT: '#722f37',
            dark: '#5c252b',
          },
          forest: {
            DEFAULT: '#2d4a2b',
            dark: '#1f331e',
          },
          stone: {
            DEFAULT: '#5a5a5a',
            dark: '#3d3d3d',
          },
          iron: '#4a4a4a',
          copper: '#b87333',
        },
      },
      fontFamily: {
        'medieval-title': ['Uncial Antiqua', 'cursive'],
        'medieval-heading': ['MedievalSharp', 'cursive'],
        'medieval-text': ['Cinzel', 'serif'],
        'cinzel': ['Cinzel', 'serif'],
      },
      backgroundImage: {
        'medieval-gradient': 'linear-gradient(135deg, #4a2c1a 0%, #1f331e 100%)',
        'medieval-card': 'linear-gradient(145deg, rgba(107, 66, 38, 0.9) 0%, rgba(74, 44, 26, 0.95) 50%, rgba(45, 74, 43, 0.9) 100%)',
        'medieval-button': 'linear-gradient(145deg, #8b5a3c, #4a2c1a)',
        'medieval-button-primary': 'linear-gradient(145deg, #d4af37, #b8941f)',
        'medieval-button-danger': 'linear-gradient(145deg, #722f37, #5c252b)',
        'medieval-button-success': 'linear-gradient(145deg, #2d4a2b, #1f331e)',
      },
      boxShadow: {
        'medieval': '0 4px 8px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(212, 175, 55, 0.2), 0 0 20px rgba(212, 175, 55, 0.1)',
        'medieval-button': '0 2px 4px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'medieval-button-hover': '0 4px 8px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 0 15px rgba(212, 175, 55, 0.3)',
        'medieval-glow': '0 0 10px rgba(212, 175, 55, 0.3)',
        'medieval-glow-strong': '0 0 20px rgba(212, 175, 55, 0.5)',
      },
      textShadow: {
        'medieval': '1px 1px 2px rgba(0, 0, 0, 0.5)',
        'medieval-strong': '2px 2px 4px rgba(0, 0, 0, 0.7)',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.text-shadow-medieval': {
          textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
        },
        '.text-shadow-medieval-strong': {
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)',
        },
      }
      addUtilities(newUtilities)
    }
  ],
}