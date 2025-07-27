import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  server: {
    allowedHosts: ['pdev.tailce422e.ts.net'],
  },
  build: {
    rollupOptions: {
      output: {
        // Create a single bundle by disabling code splitting
        manualChunks: () => 'app.js',
        // Ensure all assets are included in the main bundle
        assetFileNames: 'assets/[name][extname]',
        // Use a single entry point
        entryFileNames: 'app.js',
      },
    },
    // Minimize the output
    minify: true,
    // Disable source maps in production
    sourcemap: false,
  },
  plugins: [
    angular()
  ]
});
