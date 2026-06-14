/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#0f172a",
        surface2: "#111827",
        surface3: "#1f2937",
        border: "#334155",
        muted: "#94a3b8",
        primary: "#6366f1",
        accent: "#7c3aed",
      },
      boxShadow: {
        soft: "0 20px 60px rgba(15, 23, 42, 0.25)",
      },
    },
  },
  plugins: [],
};
