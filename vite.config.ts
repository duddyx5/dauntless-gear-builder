import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
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
  plugins: [
    react(),
    caseInsensitiveAssets(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: [
        'favicon.png',
        'favicon.ico',
        'apple-touch-icon.png',
        'pwa-192x192.png',
        'pwa-512x512.png',
        'maskable-icon-512x512.png'
      ],
      manifest: {
        name: 'Dauntless Gear Builder',
        short_name: 'Gear Builder',
        description: 'Interactive workshop for planning Dauntless weapons, armor, cells, and perk synergies across all game eras.',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'any',
        theme_color: '#081217',
        background_color: '#060d11',
        categories: ['games', 'utilities', 'entertainment'],
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.includes('/data/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'dauntless-game-data',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: ({ url }) => url.pathname.includes('/assets/'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'dauntless-assets',
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: ({ url }) =>
              url.origin.includes('fonts.googleapis.com') ||
              url.origin.includes('fonts.gstatic.com'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
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
