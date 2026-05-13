import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    // Brotli-сжатие для production (аналог compression-webpack-plugin)
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240, // Только файлы > 10 КБ
      filter: /\.(js|css|html|svg)$/,
    }),
    // Анализатор бандла — генерирует stats.html
    process.env.ANALYZE &&
      visualizer({
        filename: 'dist/stats.html',
        open: true,
        gzipSize: true,
        brotliSize: true,
        template: 'treemap',
      }),
  ].filter(Boolean),

  build: {
    // Content-hash в именах файлов (аналог [contenthash:8] в Webpack)
    rollupOptions: {
      output: {
        entryFileNames: '[name].[hash:8].js',
        chunkFileNames: '[name].[hash:8].chunk.js',
        assetFileNames: '[name].[hash:8][extname]',
        // Разбиваем вендоры в отдельный чанк
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
        },
      },
    },
    // Минимальный размер чанка для предупреждений
    chunkSizeWarningLimit: 500,
  },
});
