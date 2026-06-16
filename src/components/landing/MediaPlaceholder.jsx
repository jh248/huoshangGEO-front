/**
 * [INPUT]: 依赖 lucide-react、lib/utils cn()
 * [OUTPUT]: 命名+默认导出 MediaPlaceholder — 图片占位凹槽 (虚线边 + 内凹 + 图标 + 标签)
 * [POS]: components/landing 共享脚手架，被各承诺屏消费，等待补充真实截图/示意图
 * [PROTOCOL]: 占位件 — 接入真实图片时用 <img>/<picture> 替换整个组件，保留外层 ratio 容器
 */
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function MediaPlaceholder({
  label = "图片占位",
  hint,
  ratio = "aspect-video",
  icon: Icon = ImageIcon,
  className,
}) {
  return (
    <div
      className={cn(
        "skeu-inset relative flex w-full flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-border bg-muted/40 px-6 text-center",
        ratio,
        className
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-2xl bg-card text-muted-foreground shadow-sm">
        <Icon className="size-6" />
      </span>
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {hint && (
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}

export default MediaPlaceholder;
