import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'

  return {
    plugins: [react(), tailwindcss()],
    ...(isDev && {
      server: {
        https: {
          key: fs.readFileSync('./localhost+1-key.pem'),
          cert: fs.readFileSync('./localhost+1.pem'),
        },
        port: 5173,
      },
    }),
  }
})
