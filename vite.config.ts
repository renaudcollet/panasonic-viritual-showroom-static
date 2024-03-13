import { defineConfig } from "vite";
import removeConsole from "vite-plugin-remove-console";
import { createHtmlPlugin } from "vite-plugin-html";
// import strip from '@rollup/plugin-strip';

export default defineConfig({
  plugins: [
    removeConsole({
      includes: ["log", "info", "warn", "error", "debug"],
    }),
    createHtmlPlugin({
        minify: true,
    })
  ],
  build: {
    cssMinify: true,
    minify: true,
    // terserOptions: {
    //     compress: {
    //         drop_console: true,
    //         drop_debugger: true,
    //     },
    // }
    // rollupOptions: {
    //     plugins: [
    //         strip({
    //             functions: ['console.log', 'console.info', 'console.warn', 'console.error', 'console.debug'],
    //         }),
    //     ]
    // }
  },
});
