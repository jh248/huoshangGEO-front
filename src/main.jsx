/**
 * [INPUT]: 依赖 react 的 StrictMode、react-dom/client 的 createRoot、framer-motion 的 MotionConfig、本地 ./App.jsx 与 ./index.css
 * [OUTPUT]: 无导出 (副作用入口)，将 App 挂载到 DOM #root
 * [POS]: src/ 的应用启动点，是整个 React 树的根，被 index.html 通过 type=module 加载
 *        MotionConfig 顶层挂 reducedMotion="user" — 尊重系统 prefers-reduced-motion 偏好
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MotionConfig } from 'framer-motion'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <App />
    </MotionConfig>
  </StrictMode>,
)
