/**
 * [INPUT]: 依赖真实 Topics / ContentCreate / Articles / Prompts 页面
 * [OUTPUT]: 命名导出 Topics / ContentCreate / Articles / Prompts
 * [POS]: pages/dashboard/creation 转发集合 · App.jsx 路由消费
 * [PROTOCOL]: creation 模块四页均已落地为真实页面，本文件仅做统一转发
 */
export { default as Topics } from './Topics'
export { default as ContentCreate } from './ContentCreate'
export { default as Articles } from './Articles'
export { default as Prompts } from './Prompts'
export { default as PromptDetail } from './PromptDetail'
