/**
 * [INPUT]: 无依赖，纯常量与默认值
 * [OUTPUT]: SEGMENT_SEPARATORS / CHUNK_STRATEGY_LABEL / defaultDocConfig — 文档级解析+分段配置共享数据
 * [POS]: _documentConfig.jsx (向导) 与 Bases.jsx (文档徽标/默认值) 共同消费
 * [PROTOCOL]: 跨组件共享的非组件导出统一放此 .js，避免 react-refresh 限制
 */
export const SEGMENT_SEPARATORS = [
  { value: "newline", label: "换行" },
  { value: "double-newline", label: "空行（段落）" },
  { value: "zh-period", label: "中文句号 。" },
  { value: "en-period", label: "英文句号 ." },
];

export const CHUNK_STRATEGY_LABEL = {
  auto: "自动分段",
  custom: "自定义分段",
  hierarchical: "按层级分段",
};

export function defaultDocConfig() {
  return {
    parseStrategy: "precise",
    extract: { image: true, ocr: true, table: true },
    contentFilter: "",
    chunkStrategy: "auto",
    custom: {
      separator: "newline",
      maxLength: 800,
      overlap: 10,
      normalizeWhitespace: false,
      stripUrls: false,
    },
    hierarchical: { levels: 3, keepHierarchy: false },
  };
}
