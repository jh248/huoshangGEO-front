/**
 * [INPUT]: 依赖 react state、lucide-react、ui/Badge+Button+Card+Input+Checkbox+DatePicker、landing/BrandDiagnosisDialog、lib/utils cn
 * [OUTPUT]: 默认导出 AiSearchWorkspace — 公开品牌诊断工作区 (单一诊断流 · 对齐爱搜参考)
 *           诊断配置(品牌输入 + 平台网格[网页/手机·思考/深度] + 全选/深度思考/诊断 → 品牌诊断弹框) + 诊断记录(品牌+日期筛选 + 空状态)
 * [POS]: components/landing 公共体验组件，被公开页面 BrandDiagnosisPage 消费
 * [PROTOCOL]: 前端原型不触发跳转；按钮为后端接口预留事件挂载点；颜色仅用 token，日期用 ui/DatePicker 单日 Pill (禁双框/native date)
 */
import { useState } from "react";
import { ArrowUp, BotMessageSquare, PackageOpen, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import BrandDiagnosisDialog from "@/components/landing/BrandDiagnosisDialog";
import { cn } from "@/lib/utils";

// 诊断平台 · 12 端 = 8 平台 ×(网页/手机) · reason 为该平台的推理档
const AI_PLATFORMS = [
  { name: "豆包", mark: "豆", mobile: true, reason: "思考" },
  { name: "DeepSeek", mark: "DS", mobile: true, reason: "深度" },
  { name: "元宝", mark: "元", mobile: true, reason: "深度" },
  { name: "通义千问", mark: "千", mobile: true, reason: "深度" },
  { name: "文心一言", mark: "文", mobile: false, reason: "深度" },
  { name: "Kimi", mark: "Km", mobile: false, reason: "思考" },
];

const TILE_STYLE = {
  background:
    "linear-gradient(135deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 85%, black) 50%, color-mix(in srgb, var(--primary) 70%, black) 100%)",
  boxShadow:
    "0 4px 12px color-mix(in srgb, var(--primary) 35%, transparent), inset 0 1px 0 rgb(255 255 255 / 0.25), inset 0 -1px 0 rgb(0 0 0 / 0.1)",
};

function EndpointRow({ label, reason, deep }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-md bg-muted/40 px-3 py-1.5">
      <label className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Checkbox defaultChecked />
        {label}
      </label>
      <Badge
        variant={deep ? "accent" : "outline"}
        className={cn("h-5 rounded-xl text-[11px]", !deep && "text-muted-foreground")}
      >
        {reason}
      </Badge>
    </div>
  );
}

function PlatformCard({ platform, deep }) {
  return (
    <div className="relative flex flex-col rounded-md border border-border bg-card px-3 pb-3 pt-7 skeu-raised">
      <span
        className="absolute left-1/2 top-0 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl text-sm font-semibold text-primary-foreground"
        style={TILE_STYLE}
      >
        {platform.mark}
      </span>
      <p className="border-b border-border pb-2.5 text-center text-sm font-medium text-foreground">
        {platform.name}
      </p>
      <div className="mt-2.5 grid gap-2">
        <EndpointRow label="网页" reason={platform.reason} deep={deep} />
        {platform.mobile && (
          <EndpointRow label="手机" reason={platform.reason} deep={deep} />
        )}
      </div>
    </div>
  );
}

function AiSearchWorkspace() {
  const [brand, setBrand] = useState("");
  const [deep, setDeep] = useState(false);
  const [diagnoseOpen, setDiagnoseOpen] = useState(false);
  const [recordBrand, setRecordBrand] = useState("");
  const [recordDate, setRecordDate] = useState(null);

  const handleDiagnose = (e) => {
    e.preventDefault();
    setDiagnoseOpen(true);
  };

  return (
    <div className="w-full max-w-6xl space-y-6">
      {/* ====== 诊断配置 ====== */}
      <Card variant="raised" className="rounded-3xl py-0">
        <CardContent className="p-4 sm:p-5">
          <form onSubmit={handleDiagnose} className="flex flex-col gap-5">
            {/* 品牌输入 */}
            <div className="flex h-16 items-center gap-3 rounded-full bg-card px-5 skeu-raised sm:h-20 sm:px-6">
              <BotMessageSquare className="size-7 shrink-0 text-primary sm:size-9" />
              <Input
                aria-label="品牌名称"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="品牌名称，如：火山全域GEO"
                className="h-full flex-1 border-0 bg-transparent px-0 text-base font-medium shadow-none placeholder:text-muted-foreground focus-visible:ring-0 sm:text-xl"
                style={{ background: "transparent", boxShadow: "none" }}
              />
              <Button
                type="submit"
                size="icon"
                aria-label="开始品牌诊断"
                className="h-11 w-11 rounded-full sm:h-14 sm:w-14"
              >
                <ArrowUp className="size-5 sm:size-7" />
              </Button>
            </div>

            {/* 平台网格 */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {AI_PLATFORMS.map((platform) => (
                <PlatformCard key={platform.name} platform={platform} deep={deep} />
              ))}
            </div>

            {/* 底部工具条 */}
            <div className="flex flex-wrap items-center justify-end gap-5">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Checkbox defaultChecked />
                全选
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Checkbox checked={deep} onCheckedChange={(v) => setDeep(!!v)} />
                深度思考
              </label>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* ====== 诊断记录 ====== */}
      <Card variant="raised" className="rounded-3xl py-0">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-foreground">诊断记录</h2>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                aria-label="筛选品牌"
                value={recordBrand}
                onChange={(e) => setRecordBrand(e.target.value)}
                placeholder="品牌"
                className="h-9 w-40"
              />
              <DatePicker
                value={recordDate}
                onChange={setRecordDate}
                placeholder="诊断日期"
                className="h-9"
              />
              <Button type="button" size="sm" leftIcon={<Search />}>
                搜索
              </Button>
            </div>
          </div>

          {/* 空状态 */}
          <div className="mt-4 flex min-h-52 flex-col items-center justify-center gap-3 rounded-md border border-dashed border-border bg-muted/30 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-card text-muted-foreground shadow-sm">
              <PackageOpen className="size-7" />
            </span>
            <p className="text-sm text-muted-foreground">
              暂无诊断记录，完成一次品牌诊断后将在这里展示报告。
            </p>
          </div>
        </CardContent>
      </Card>

      <BrandDiagnosisDialog
        open={diagnoseOpen}
        onOpenChange={setDiagnoseOpen}
        defaultBrand={brand}
      />
    </div>
  );
}

export default AiSearchWorkspace;
