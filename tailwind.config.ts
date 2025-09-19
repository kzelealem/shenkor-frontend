import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities({
        ".progress-ring": {
          "@property --p": {
            syntax: "'<number>'",
            inherits: false,
            initialValue: "0",
          } as any, // <-- Cast only the nested object to any
          transition: "--p 0.6s ease-in-out",
        },
      });
    }),
  ],
} satisfies Config;