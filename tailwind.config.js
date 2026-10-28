/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        sunken: "var(--sunken)",
        fg: "var(--fg)",
        muted: "var(--muted)",
        line: "var(--line)",
        fill: "var(--fill)",
        "on-fill": "var(--on-fill)",
        accent: "var(--accent)",
        star: "var(--star)",
        "star-off": "var(--star-off)",
        danger: "var(--danger)",
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
