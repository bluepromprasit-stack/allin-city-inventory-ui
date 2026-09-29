import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: './',
  // All In City: the dev server (`npm run start`, browser mock) serves ox's item art from the vendored resource at
  // /images/*.png; the build copies nothing (upstream: publicDir false).
  publicDir: command === 'serve' ? '../../../resources/[core]/ox_inventory/web' : false,
  build: {
    outDir: 'build',
    target: 'esnext',
    emptyOutDir: true,
    // All In City: inline the Bai Jamjuree .woff2 files into assets/index.css. ox_inventory's fxmanifest only serves
    // web/build/index.html + assets/*.js + assets/*.css, so a separate font file would never load in game.
    assetsInlineLimit: (file: string) => (file.endsWith('.woff2') ? true : undefined),
    rolldownOptions: {
      output: {
        // All In City: keep the libraries' own license headers (`@license` / `/*!` comments of React, DOMPurify, ...)
        // in the shipped bundle — vite drops them when minifying. We build and distribute this bundle, so the MIT /
        // Apache / MPL notices travel with it (upstream's release bundle had none; same bytes otherwise).
        comments: { legal: true, annotation: false, jsdoc: false },
        assetFileNames: 'assets/[name][extname]',
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
      },
    },
  },
}));
