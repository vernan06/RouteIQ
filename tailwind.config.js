/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: "#080c18",
        sidebarBg: "#0c1020",
        cardBg: "#0f1628",
        borderColor: "rgba(255, 255, 255, 0.07)",
        primaryAccent: "#3b82f6",
        textPrimary: "#e2e8f0",
        textSecondary: "#64748b",
        textMuted: "#334155",
        
        // Modules
        routeOpt: "#8b5cf6",
        fleetSort: "#10b981",
        netMap: "#f59e0b",
        budgetAlloc: "#ef4444",
        scheduler: "#06b6d4",
        docSearch: "#ec4899",
        gridPlan: "#84cc16",
        ticketQueue: "#f97316"
      }
    },
  },
  plugins: [],
}
