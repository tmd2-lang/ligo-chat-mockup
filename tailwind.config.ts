import type { Config } from "tailwindcss";

/**
 * Ligo design tokens — ported 1:1 from the design folder's
 * `colors_and_type.css` (:root). Do not invent values here;
 * every entry traces back to the brand kit.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ligo: {
          orange: "#F97316",
          "orange-deep": "#C2410C",
          yellow: "#F5D783",
          cream: "#F5D783",
          green: "#71C07F",
          pink: "#EA8CE1",
          "pink-deep": "#A13D99",
          night: "#0A0907",
          ink: "#14110D",
          paper: "#FAFAF8",
        },
        // surfaces
        surface: {
          paper: "#FAFAF8",
          card: "#FFFFFF",
          sunken: "#F5F5F3",
          night: "#0A0907",
          "night-card": "#181614",
        },
      },
      fontFamily: {
        display: [
          "Bricolage Grotesque",
          "-apple-system",
          "SF Pro Display",
          "sans-serif",
        ],
        body: [
          "-apple-system",
          "SF Pro Display",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: ["SF Mono", "Fira Code", "ui-monospace", "monospace"],
      },
      fontSize: {
        hero: ["38px", { lineHeight: "1.05", letterSpacing: "-0.025em" }],
        h1: ["32px", { lineHeight: "1.18", letterSpacing: "-0.02em" }],
        h2: ["28px", { lineHeight: "1.18", letterSpacing: "-0.02em" }],
        h3: ["22px", { lineHeight: "1.2", letterSpacing: "-0.015em" }],
        h4: ["18px", { lineHeight: "1.2", letterSpacing: "-0.015em" }],
        "body-lg": ["17px", { lineHeight: "1.5" }],
        body: ["15px", { lineHeight: "1.5" }],
        small: ["13px", { lineHeight: "1.4" }],
        caption: ["12px", { lineHeight: "1.4" }],
        eyebrow: ["11px", { lineHeight: "1.2" }],
        min: ["10px", { lineHeight: "1.2" }],
      },
      letterSpacing: {
        display: "-0.025em",
        h: "-0.02em",
        tight: "-0.015em",
        eyebrow: "0.14em",
        caps: "0.18em",
        wordmark: "-0.04em",
      },
      borderRadius: {
        pill: "999px",
        card: "22px",
        "card-sm": "18px",
        box: "16px",
        chip: "12px",
        tile: "10px",
      },
      spacing: {
        // canonical Ligo spacing scale (in addition to Tailwind defaults)
        "s1": "4px",
        "s2": "8px",
        "s3": "12px",
        "s4": "16px",
        "s5": "22px", // canonical screen edge
        "s6": "28px",
        "s7": "40px",
        "s8": "56px",
        "s9": "72px",
      },
      boxShadow: {
        "el-1":
          "0 1px 0 rgba(20,17,13,0.02), 0 6px 18px -12px rgba(20,17,13,0.08)",
        "el-2":
          "0 1px 0 rgba(20,17,13,0.04), 0 8px 24px -8px rgba(20,17,13,0.10)",
        "el-3": "0 12px 30px -12px rgba(20,17,13,0.20)",
        "el-sheet": "0 -20px 50px rgba(0,0,0,0.25)",
        "el-orange-cta":
          "0 12px 28px -8px rgba(249,115,22,0.55), 0 0 0 1px rgba(249,115,22,0.20)",
        "el-versus": "0 18px 40px -16px rgba(10,9,7,0.4)",
      },
      transitionTimingFunction: {
        "ligo-out": "cubic-bezier(.2,.7,.2,1)",
      },
      transitionDuration: {
        fast: "150ms",
        base: "220ms",
        slow: "400ms",
      },
      keyframes: {
        "ligo-pulse": {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.6)", opacity: "0.5" },
        },
        "ligo-rise": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "ligo-sheet-up": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "ligo-fade": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "ligo-pulse": "ligo-pulse 1.6s ease-in-out infinite",
        "ligo-rise": "ligo-rise 380ms cubic-bezier(.2,.7,.2,1)",
        "ligo-sheet-up": "ligo-sheet-up 320ms cubic-bezier(.2,.7,.2,1)",
        "ligo-fade": "ligo-fade 220ms ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
