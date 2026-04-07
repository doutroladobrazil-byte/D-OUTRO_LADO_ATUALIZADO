import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
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
        halo: "0 0 0 1px rgba(255,255,255,0.08), 0 24px 80px rgba(0,0,0,0.35)"
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
          "radial-gradient(circle at top left, rgba(245,245,245,0.22), transparent 26%), radial-gradient(circle at bottom right, rgba(217,221,227,0.2), transparent 24%)"
      }
    }
  },
  plugins: []
};

export default config;
