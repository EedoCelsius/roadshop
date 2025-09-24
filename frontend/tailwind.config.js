/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        roadshop: {
          primary: "#111827",
          accent: "#00C896",
          highlight: "#F3F4F6",
        },
      },
      fontFamily: {
        sans: ["'Pretendard Variable'", "Inter", "ui-sans-serif", "system-ui"],
      },
    },
  },
  plugins: [],
}
