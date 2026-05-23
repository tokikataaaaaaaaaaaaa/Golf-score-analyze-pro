import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

// base: "./" keeps asset URLs relative, so the build works under any
// GitHub Pages path (https://user.github.io/<repo>/) without extra config.
//
// viteSingleFile inlines all JS/CSS into a single dist/index.html, so the app
// can be published by uploading ONE file to a public repo (no build step, no
// terminal) and serving it directly with GitHub Pages.
export default defineConfig({
  base: "./",
  plugins: [react(), viteSingleFile()],
});
