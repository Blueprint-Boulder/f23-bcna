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
        "light-blue" : "#3EAAF5",
      },
      height: {
        "15": "3.75rem",
        "18": "4.5rem",
        "20": "5rem",
        "22": "5.5rem",
        "24": "6rem",
        "26": "6.5rem",
        "28": "7rem",
      },
      width: {
        "15": "3.75rem",
        "18": "4.5rem",
        "20": "5rem",
        "22": "5.5rem",
        "24": "6rem",
        "26": "6.5rem",
        "28": "7rem",
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}

