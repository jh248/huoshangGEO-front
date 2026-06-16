/**
 * [INPUT]: 无外部依赖 (framer-motion 在组件侧消费)
 * [OUTPUT]: 命名导出
 *   springs (snappy/gentle/bouncy/smooth/inertia 五档 Spring 物理预设)
 *   appleEase / appleEaseOut / appleDecelerate (非 Spring 曲线 fallback)
 *   defaultViewport (whileInView 视口公约)
 *   variants: fadeInUp / scaleIn / slideInLeft / slideInRight / staggerContainer / staggerItem
 *   交互: hoverLift / tapScale
 *   循环: circularTextSpin
 *   模态: modalOverlay / modalContent
 *   路由: pageTransition
 * [POS]: src/lib 的动效公约，被 landing/ 全部 Section + pages/ + ui/Button 消费
 *        所有 Spring 参数 / 缓动曲线 / 动效模式集中此处，组件侧禁止现写 transition
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

// ============================================================================
// Spring 物理预设 · Apple 级手感的五档
// snappy   微交互     按钮 hover / icon 微动     ~200ms 体感
// gentle   柔和过渡   元素进场 / 面板展开        ~350ms
// bouncy   弹性强调   关键反馈 / 徽章弹出        ~300ms
// smooth   优雅落定   大块面板 / 页面 chrome     ~500ms
// inertia  惯性滑动   列表 / 轮播                ~450ms
// ============================================================================
export const springs = {
  snappy:  { type: 'spring', stiffness: 400, damping: 30 },
  gentle:  { type: 'spring', stiffness: 300, damping: 35 },
  bouncy:  { type: 'spring', stiffness: 500, damping: 25, mass: 0.8 },
  smooth:  { type: 'spring', stiffness: 200, damping: 40, mass: 1.2 },
  inertia: { type: 'spring', stiffness: 150, damping: 20, mass: 0.5 },
}

// ============================================================================
// 非 Spring 缓动曲线 · 仅用于退场 / 透明度淡入等不需要物理弹性的场景
// ============================================================================
export const appleEase        = [0.25, 0.1, 0.25, 1.0] // iOS 标准
export const appleEaseOut     = [0.22, 1, 0.36, 1]     // iOS 弹出
export const appleDecelerate  = [0, 0, 0.2, 1]         // iOS 减速

// ============================================================================
// 视口公约 · whileInView 默认参数 · 仅触发一次，进入 100px 后才动
// ============================================================================
export const defaultViewport = { once: true, margin: '-100px' }

// ============================================================================
// 进场动效 · Spring 版 · 替代旧的 duration+ease 写法
// ============================================================================
export const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: springs.gentle },
}

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: springs.bouncy },
}

export const slideInLeft = {
  hidden: { opacity: 0, x: -32 },
  visible: { opacity: 1, x: 0, transition: springs.smooth },
}

export const slideInRight = {
  hidden: { opacity: 0, x: 32 },
  visible: { opacity: 1, x: 0, transition: springs.smooth },
}

// ============================================================================
// 序列进场 · 父容器 + 子元素配对
// stagger 间隔 0.06s · delayChildren 0.1s · 子元素自带 Spring
// ============================================================================
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
}

export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 350, damping: 30 },
  },
}

// ============================================================================
// 悬浮提升 · Apple Card 经典效果 · 配合 .skeu-raised 的阴影加深
// 用法: <motion.div initial="rest" whileHover="hover" variants={hoverLift}>
// ============================================================================
export const hoverLift = {
  rest: { scale: 1, y: 0, transition: springs.snappy },
  hover: { scale: 1.02, y: -4, transition: springs.snappy },
}

// ============================================================================
// 点击回弹 · whileTap 直接传 spring · Button / 可交互卡片用
// ============================================================================
export const tapScale = {
  scale: 0.96,
  transition: { type: 'spring', stiffness: 500, damping: 30 },
}

// ============================================================================
// 循环动效 · 环形文字匀速转动
// 圆周文本需要恒定角速度，否则每圈接缝会有顿挫；集中定义，组件侧只消费。
// ============================================================================
export const circularTextSpin = {
  rotate: 360,
  transition: {
    duration: 18,
    repeat: Infinity,
    ease: 'linear',
  },
}

// ============================================================================
// 模态层 · 背景纯透明度 · 内容弹性落定 + 退场短 duration
// ============================================================================
export const modalOverlay = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2, ease: appleDecelerate } },
  exit: { opacity: 0, transition: { duration: 0.15, ease: appleEase } },
}

export const modalContent = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: springs.gentle },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15, ease: appleEase } },
}

// ============================================================================
// 路由过渡 · AnimatePresence mode="wait" 配合使用
// 进入: 自右滑入 + Spring 落定 · 退出: 自左滑出 + 短 duration
// ============================================================================
export const pageTransition = {
  initial: { opacity: 0, x: 20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 260, damping: 40 },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: { duration: 0.2, ease: appleEase },
  },
}
