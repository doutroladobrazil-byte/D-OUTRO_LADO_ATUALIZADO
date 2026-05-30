import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // ── EDITORIAL PALETTE ──────────────────────────────────────────────
        canvas: "#FAF8F5",
        surface: {
          DEFAULT: "#F2EDE6",
          alt: "#EDE8DF",
        },
        ink: {
          DEFAULT: "#1C1712",
          mid: "#6B5F52",
          soft: "#A0917F",
          ghost: "#C8BAA8",
        },
        leather: "#7A5C3E",
        terracotta: "#B5614A",
        verde: "#2A3D2B",
        noir: "#141210",
        // ── LEGACY — kept for admin + gradual migration ────────────────────
        obsidian: "#0A0A0A",
        charcoal: "#121212",
        soft: "#1E1E1E",
        ivory: "#F5F5F5",
        cloud: "#ECECEC",
        silver: "#D8D8D8",
        mist: "#D9DDE3",
        gold: "#C6A96B",
        casa: {
          sand: "#F5F5F5",
          terracotta: "#D8D8D8",
          olive: "#D9DDE3",
          ink: "#0F0F0F"
        },
        moda: {
          noir: "#000000",
          leather: "#D8D8D8",
          gold: "#C6A96B",
          cream: "#F5F5F5"
        }
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"]
      },
      boxShadow: {
        luxe: "0 10px 40px rgba(0,0,0,0.3)",
        halo: "0 0 0 1px rgba(255,255,255,0.08), 0 24px 80px rgba(0,0,0,0.35)",
        "luxe-light": "0 2px 20px rgba(28,23,18,0.07), 0 8px 40px rgba(28,23,18,0.05)",
        "halo-light": "0 0 0 1px rgba(28,23,18,0.06), 0 16px 60px rgba(28,23,18,0.08)"
      },
      borderRadius: {
        luxe: "24px"
      },
      maxWidth: {
        luxe: "1280px"
      },
      backgroundImage: {
        "grain-dark":
          "radial-gradient(circle at top, rgba(198,169,107,0.16), transparent 30%), linear-gradient(180deg, rgba(255,255,255,0.06), transparent)",
        "grain-casa":
          "radial-gradient(circle at top left, rgba(245,245,245,0.22), transparent 26%), radial-gradient(circle at bottom right, rgba(217,221,227,0.2), transparent 24%)",
        "grain-light":
          "radial-gradient(circle at top, rgba(122,92,62,0.06), transparent 40%), linear-gradient(180deg, rgba(255,255,255,0.6), rgba(242,237,230,0.3))"
      }
    }
  },
  plugins: []
};

export default config;
