import type { Config } from "tailwindcss"

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: "#2563eb" },
        success: "#16a34a",
        danger: "#dc2626"
      }
    }
  }
} satisfies Config
