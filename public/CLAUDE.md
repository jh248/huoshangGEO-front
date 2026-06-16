# public/
> L2 | 父级: ../CLAUDE.md

## 成员清单

favicon.svg: 浏览器标签页图标，根路径 /favicon.svg，被 index.html 通过 <link rel="icon"> 引用

## 暴露接口

所有文件以根路径形式被引用，URL 形如 /favicon.svg

## 约定

- 此目录不参与 import 解析，Vite 原样拷贝到 dist
- 仅放需要稳定 URL 的资源 (favicon、robots.txt、SEO 资源、第三方 sitemap)
- 业务图片优先放 src/assets/ 走 import，享受哈希指纹

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
