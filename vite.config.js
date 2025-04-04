import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import svgr from 'vite-plugin-svgr'
import { VitePWA } from "vite-plugin-pwa"
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    svgr(),
      VitePWA({
        injectRegister: 'auto',
        registerType: "autoUpdate",
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,webp}'],
          runtimeCaching: [{
            handler: 'NetworkOnly',
            urlPattern: /^https?:\/\//,
            method: "POST",
            options: {
              backgroundSync: {
                name: 'queue',
                options: {
                  maxRetentionTime: 24 * 60
                }
              }
            }
          }]
        },
        manifest: {
          "name": "Pelky",
          "short_name": "Pelky",
          "description": "Drop by yourself and see what's changed",
          "theme_color": "#0f172b",
          "background_color": "#0f172b",
          "display": "standalone",
          "orientation": "portrait",
          "id": "https://pelky.leszczak.pl",
          "categories": ["productivity","health","lifestyle"],
          "dir": "left",
          "start_url": "/",
          "scope": "/",
          "icons": [
            {
              "src": "/pelky-dark.svg",
              "sizes": "any",
              "purpose": "any"
            },
            {
              "src": "/512.png",
              "sizes": "512x512",
              "type": "image/png"
            },
            {
              "src": "/192.png",
              "sizes": "192x192",
              "type": "image/png"
            },
            {
              "src": "/512.png",
              "sizes": "512x512",
              "type": "image/png",
              "purpose": "maskable"
            }
          ]
        },
        defaultOptions: { enabled: false }
      })
  ],
  resolve: {
    alias: {
      // eslint-disable-next-line no-undef
      '@': path.resolve(__dirname, 'src'),
    }
  },
})