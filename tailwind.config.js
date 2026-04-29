/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        /* ── SIGDA Light Palette ── */
        "sidebar":        "#1A3A6B",
        "bg-page":        "#F3F4F6",
        "bg-card":        "#ffffff",
        "border-light":   "#E5E7EB",
        "text-primary":   "#1F2937",
        "text-muted":     "#6B7280",
        "text-light":     "#9CA3AF",
        "blue-deep":      "#1A3A6B",
        "blue-mid":       "#2D6FAD",
        "green-ok":       "#2E7D52",
        "gold-accent":    "#C9A227",
        "red-alert":      "#C0392B",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
}
