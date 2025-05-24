import { rmSync } from "fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import electron from "vite-plugin-electron";

rmSync("dist", { recursive: true, force: true });

export default defineConfig({
  server: {
    port: 8888,
  },
  plugins: [
    react(),
    electron({
      main: {
        entry: "src/electron/main.ts",
        vite: {
          build: {
            sourcemap: "inline",
          },
        },
      },
    }),
  ],
});
