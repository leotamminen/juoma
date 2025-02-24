/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // Aktivoi dark mode "class"-tilassa
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}", // Lisää myös app/ hakemisto Next.js:n kanssa
  ],
  theme: {
    extend: {
      colors: {
        // Voit laajentaa väripalettia tarvittaessa
        darkBackground: "#1a202c",
        darkText: "#a0aec0",
        lightBackground: "#f7fafc",
        lightText: "#2d3748",
      },
    },
  },
  plugins: [],
};
