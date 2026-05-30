import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import Markdown from "@pity/vite-plugin-react-markdown";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), Markdown({ wrapperClasses: "prose prose-headings:font-serif max-w-none" })],
  server: {
    port: 3000,
    proxy: {
      "/api": "http://localhost:5001"
    },
    allowedHosts: true
  }
});
