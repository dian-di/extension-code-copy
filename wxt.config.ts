import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'wxt'

// See https://wxt.dev/api/config.html
export default defineConfig({
  outDir: "dist",
  manifest: {
    permissions: ['storage', 'sidePanel', 'tabs'],
    name: 'Code Copy',
    version: '0.0.4',
    description: 'Easy Code Copy',
    host_permissions: ['<all_urls>'],
    action: {
      default_title: 'Click to open panel',
    },
  },
  vite: () => ({
    plugins: [
      react(),
      tailwindcss(),
    ],
  }),
})
