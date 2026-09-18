import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { nodeHandler } from "./server/nodeHandler.js";
export default defineConfig(({ mode }) => {
  const env = { ...process.env, ...loadEnv(mode, process.cwd(), "") };
  return {
    plugins: [
      react(),
      {
        name: "local-storage-api",
        configureServer(server) {
          server.middlewares.use("/api/answers", (req, res) =>
            nodeHandler(req, res, env),
          );
        },
      },
    ],
    server: {
      port: 5173,
      strictPort: true,
      fs: {
        deny: [
          ".env",
          ".env.*",
          "*.{crt,pem}",
          "**/.git/**",
          "**/data/**",
          "**/server/**",
        ],
      },
    },
  };
});
