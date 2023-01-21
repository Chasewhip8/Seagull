module.exports = {
  mode: "jit",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "media",
  theme: {
    extend: {
      colors: {},
    },
  },
  plugins: [require("@tailwindcss/typography"), require("@tailwindcss/forms")],
};
