import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    minify: "esbuild",

    rollupOptions: {
      input: "src/h5p-editor-csv-to-text.ts",
      output: {
        file: "dist/h5p-editor-csv-to-text.js",
        dir: undefined,
        esModule: false,
        format: "iife",
      },
    },

    target: "es6",
  },
});
