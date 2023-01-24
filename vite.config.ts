import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    minify: "esbuild",
    sourcemap: true,
    target: "ES2015",

    lib: {
      entry: ["src/h5p-editor-csv-to-text.ts"],
      formats: ["iife"],
      name: "H5PEditorCsvToText",
      fileName: () => "h5p-editor-csv-to-text.js",
    },
  },
});
