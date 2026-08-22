import type { Config } from "tailwindcss"

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: ["variant", '&:where([data-t="dark"], [data-t="dark"] *)'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: "var(--pri)", ink: "var(--priInk)", soft: "var(--priCont)", on: "var(--priC)" },
        success: { DEFAULT: "var(--ok)", soft: "var(--okBg)" },
        danger: { DEFAULT: "var(--dg)", soft: "var(--dgBg)" },
        warn: { DEFAULT: "var(--wn)", soft: "var(--wnBg)" },
        surface: { DEFAULT: "var(--surf)", bg: "var(--bg)", raised: "var(--cont)", sunken: "var(--cont2)" },
        ink: { DEFAULT: "var(--ink)", muted: "var(--mut)" },
        line: "var(--line)",
        bar: { DEFAULT: "var(--bar)", ink: "var(--barI)" }
      },
      fontFamily: {
        sans: ["Roboto", "Roboto Flex", "system-ui", "-apple-system", "sans-serif"]
      }
    }
  }
} satisfies Config
