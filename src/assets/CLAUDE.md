# src/assets/
> L2 | 父级: ../CLAUDE.md

## 成员清单

(空) — 当前无静态资源被 ESM 引入

## 约定

- 二进制图片用 import 方式引入，让 Vite 接管哈希指纹
- 全局静态资源 (favicon, 公开 SVG) 放在 /public 而非此处
- 单文件不超过 500KB，超出考虑外链 CDN
- 新增资源时在此清单同步登记 (文件名 + 用途 + 体积 + 消费方)

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
