import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

function caseInsensitiveAssets(): Plugin {
  return {
    name: 'case-insensitive-assets',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.startsWith('/assets/icons/perks/')) {
          const urlClean = req.url.split('?')[0];
          const fileName = path.basename(urlClean);
          const perksDir = path.resolve(__dirname, 'public/assets/icons/perks');
          if (fs.existsSync(perksDir)) {
            const files = fs.readdirSync(perksDir);
            const match = files.find(f => f.toLowerCase() === fileName.toLowerCase());
            if (match) {
              const fullPath = path.join(perksDir, match);
              const ext = path.extname(match).toLowerCase();
              const contentType = ext === '.svg' ? 'image/svg+xml' : 'image/png';
              res.setHeader('Content-Type', contentType);
              res.setHeader('Cache-Control', 'no-cache');
              return fs.createReadStream(fullPath).pipe(res);
            }
          }
        }
        next();
      });
    }
  };
}

export default defineConfig({
  base: './',
  plugins: [react(), caseInsensitiveAssets()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 5173,
    host: true
  }
});
