/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    // Classes de présentation centralisées (statuts, priorités, avatars)
    "./lib/ui/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    // Tokens « Ardoise » : docs/refonte/01-design-tokens.md
    extend: require("./lib/ui/tailwind.tokens.js"),
  },
  plugins: [],
};
