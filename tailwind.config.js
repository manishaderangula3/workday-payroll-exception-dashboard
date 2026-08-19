/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        workday: {
          blue: "#1976D2",
          green: "#4CAF50",
          amber: "#FF9800",
          red: "#F44336",
          ink: "#172033"
        }
      },
      boxShadow: {
        panel: "0 18px 45px rgba(23, 32, 51, 0.08)"
      }
    }
  },
  plugins: []
};
