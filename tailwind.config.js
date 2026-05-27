/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Pretendard Variable", "SUIT Variable", "Noto Sans KR", "sans-serif"],
      },
      colors: {
        ink: {
          50: "#f8f8f6",
          100: "#f1f0eb",
          200: "#dedbcf",
          300: "#c8c2b3",
          500: "#847b67",
          700: "#4d4537",
          900: "#27231c",
        },
        accent: {
          50: "#fff9eb",
          100: "#fff0c7",
          300: "#f9ce6b",
          500: "#efad2f",
          700: "#b7710f",
        },
        valid: {
          100: "#e5f6ee",
          500: "#3a8f61",
        },
        danger: {
          100: "#fbe7e7",
          500: "#c94f4f",
        },
      },
      boxShadow: {
        paper: "0 24px 80px rgba(39, 35, 28, 0.10)",
      },
      backgroundImage: {
        paper:
          "radial-gradient(circle at top left, rgba(255, 255, 255, 0.9), rgba(241, 240, 235, 0.9) 60%), linear-gradient(180deg, rgba(255,255,255,0.86), rgba(241,240,235,0.94))",
      },
    },
  },
  plugins: [],
};
