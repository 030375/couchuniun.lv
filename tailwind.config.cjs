/** Build only the Tailwind utilities used by the public site. Keep the original v3 visual vocabulary. */
module.exports = {
  content: [
    './index.html',
    './raspisanie.html',
    './otziw.html',
    './business-coach.html',
    './bisness_kouch.html',
    './library.html',
    './app.js'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0056b3',
        secondary: '#00a8e8',
        accent: '#ff6b35',
        light: '#f8f9fa',
        dark: '#212529'
      }
    }
  },
  safelist: [
    'hidden', 'block', 'flex', 'grid',
    'opacity-100', 'rotate-180', 'scale-100', 'translate-y-0',
    'text-white', 'bg-primary', 'is-visible'
  ],
  plugins: []
};
