import { defineConfig } from 'vite'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// ============================================================================
// Vite Config — React + TailwindCSS v4
// 别名 @ -> ./src 让 import 路径如思想般直白
// ============================================================================
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    // 避免 Tiptap 等依赖各自解析出第二份 React，导致 "Invalid hook call"
    dedupe: ['react', 'react-dom'],
  },
})
