# src/assets/
> L2 | 父级: ../CLAUDE.md

## 成员清单

article/article-consulting-banner.jpg: 文章资讯页首屏 banner 背景图 (AI 星环 · 文字叠加在左侧空白区)，源自用户提供图片并缩放至 1920 宽转 JPEG，约 76KB，被 pages/ArticleConsultingPage.jsx 消费
article/article-consulting-hero.webp: 旧版首屏右侧视觉图，约 29KB，已被 banner 取代，暂留备用

## 约定

- 二进制图片用 import 方式引入，让 Vite 接管哈希指纹
- 全局静态资源 (favicon, 公开 SVG) 放在 /public 而非此处
- 单文件不超过 500KB，超出考虑外链 CDN
- 新增资源时在此清单同步登记 (文件名 + 用途 + 体积 + 消费方)

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
