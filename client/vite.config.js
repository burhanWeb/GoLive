import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0", // Allow the server to be accessible externally
    port: 5173, // Ensure the correct port is exposed
  },
});
