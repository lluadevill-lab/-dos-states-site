/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primeColor: "#262626",
        lightText: "#6D6D6D",
      },
      boxShadow: {
        testShadow: "0px 0px 54px -13px rgba(0,0,0,0.7)",
      },
      fontFamily: {
        sans: ["Work Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
}
