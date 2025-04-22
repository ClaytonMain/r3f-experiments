import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import glsl from "vite-plugin-glsl";
import restart from "vite-plugin-restart";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tsconfigPaths(),
    react(),
    restart({
      // restart: ["src/**/shaders/**/*", "src/**/*.tsx"],
      restart: ["src/**/shaders/**/*"],
    }),
    glsl({
      watch: true,
    }),
    tailwindcss(),
  ],
  server: {
    host: true,
    open: true,
  },
});
