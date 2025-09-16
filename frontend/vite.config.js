import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.js",
  },
  server: {
    proxy: {
      // forwards http://localhost:5173/graphql -> http://127.0.0.1:8000/graphql
      "/graphql": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
    },
  },
});
