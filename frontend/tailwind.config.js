/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}",],
  theme: {
    extend: {
      colors: {
        "dark-green": "#70903B",
        "light-green": "#99C457",
        "highlight-green": "#7DDA23",
        "light-black" : "#2B2B2B",
        "black" : "#171717",
        "light-blue" : "#3EAAF5"
      }
    }
  },
  plugins: [],
}

