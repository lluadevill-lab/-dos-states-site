/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
    },
    extend: {
      maxWidth: {
        container: '1280px',
      },
      colors: {
        // Identidade "manifesto de carga / desembaraço aduaneiro"
        ink: '#101C2C',        // texto principal — tinta de carimbo
        paper: '#FCFCFA',      // fundo — papel de formulário
        paperDim: '#F3F3EF',   // fundo secundário (cards, seções)
        line: '#DEDFD9',       // linhas/hairlines de formulário
        stamp: '#D7263D',      // vermelho de carimbo aduaneiro — ação primária
        stampDark: '#B31E32',
        teal: '#0E6F6E',       // azul-piscina Miami — apoio/links
        tealDark: '#0A5453',
        gold: '#F2A93B',       // etiqueta de oferta/alerta
        muted: '#5B6472',      // texto secundário
        // aliases usados no código legado
        primeColor: '#101C2C',
        lightText: '#5B6472',
      },
      fontFamily: {
        display: ['"Big Shoulders Stencil"', 'sans-serif'],
        sans: ['"Work Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
        titleFont: ['"Work Sans"', 'sans-serif'],
      },
      backgroundImage: {
        'dashed-x': 'repeating-linear-gradient(to right, currentColor 0, currentColor 6px, transparent 6px, transparent 14px)',
      },
      keyframes: {
        dash: {
          to: { strokeDashoffset: '-24' },
        },
        stampIn: {
          '0%': { transform: 'scale(1.6) rotate(-8deg)', opacity: '0' },
          '60%': { transform: 'scale(0.94) rotate(-8deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(-8deg)', opacity: '1' },
        },
      },
      animation: {
        dash: 'dash 1.2s linear infinite',
        stampIn: 'stampIn 0.5s cubic-bezier(.2,.8,.2,1) both',
      },
      boxShadow: {
        testShadow: '0px 0px 54px -13px rgba(0,0,0,0.7)',
        tag: '0 1px 0 rgba(16,28,44,0.06), 0 8px 20px -12px rgba(16,28,44,0.25)',
      },
    },
  },
  plugins: [],
}
