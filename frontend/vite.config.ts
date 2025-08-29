import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),                // frontend/src
      "@shared": path.resolve(__dirname, "../shared"),      // shared folder (outside frontend)
      "@assets": path.resolve(__dirname, "../attached_assets"), // attached_assets (outside frontend)
    },
  },
  root: path.resolve(__dirname, "."), // frontend folder is root now
  build: {
    outDir: path.resolve(__dirname, "../dist/public"), // build goes outside frontend
    emptyOutDir: true,
    rollupOptions: {
      external: [],
      output: {
        manualChunks: undefined,
      },
    },
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
