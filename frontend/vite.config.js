import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/setupTests.js",
  },
  resolve: {
    alias: {
      react: path.resolve(__dirname, "node_modules", "react"),
      "react-dom": path.resolve(__dirname, "node_modules", "react-dom"),
    },
    
  },
  server: {
    port: 3000,
    proxy: {
      "/bidsphere": {
<<<<<<< HEAD
        target: "https://bidsphereforked.onrender.com",
=======
        target: "https://bidsphere-backend-6mxy.onrender.com",
>>>>>>> upstream/main
        changeOrigin: true,
        secure: false,
      },
    },
  },
});