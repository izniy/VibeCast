/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#6366F1",
        secondary: "#4F46E5",
        background: "#F3F4F6",
        surface: "#FFFFFF",
        error: "#EF4444",
        success: "#10B981",
      },
    },
  },
  plugins: [],
};