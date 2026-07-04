import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: { center: true, padding: "1.5rem" },
    extend: {
      colors: {
        ink: {
          DEFAULT: "hsl(var(--ink))",
          muted: "hsl(var(--ink-muted))",
          faint: "hsl(var(--ink-faint))",
        },
        paper: {
          DEFAULT: "hsl(var(--paper))",
          raised: "hsl(var(--paper-raised))",
        },
        line: "hsl(var(--line))",
        accent: "hsl(var(--accent))",
        background: "hsl(var(--paper))",
        foreground: "hsl(var(--ink))",
        border: "hsl(var(--line))",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Pretendard", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "Times New Roman", "serif"],
      },
      maxWidth: { prose: "68ch" },
      borderRadius: { lg: "2px", md: "2px", sm: "2px" },
    },
  },
  plugins: [],
};
export default config;
