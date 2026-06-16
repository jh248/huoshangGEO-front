/**
 * [INPUT]: 依赖 react state、lucide-react、ui/Dialog+Button、lib/utils cn
 * [OUTPUT]: 默认导出 CreditsPurchaseDialog — 充值积分弹窗 (购买积分标题 + 我的积分 + 4 档套餐卡 + 支付区 二维码/支付方式/应付金额)
 *           受控 props: { open, onOpenChange, balance }
 * [POS]: components/landing 共享子件，由 BrandDiagnosisDialog 头部「购买」唤起
 * [PROTOCOL]: 前端原型 — 套餐/支付为 mock，二维码为占位；颜色仅用 token，禁止 hex
 */
import { useState } from "react";
import { Check, Coins, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// 积分套餐 mock · 618 特惠
const PACKAGES = [
  { credits: 200, price: 80, original: 200, off: "4折", note: "购买享5折*618活动8折", per: "0.32" },
  { credits: 1200, price: 432, original: 1200, off: "3.6折", note: "购买享4.6折*618活动8折", per: "0.29" },
  { credits: 6000, price: 2040, original: 6000, off: "3.4折", note: "购买享4.3折*618活动8折", per: "0.27" },
  { credits: 30000, price: 9600, original: 30000, off: "3.2折", note: "购买享4折*618活动8折", per: "0.26" },
];

const PAYMENTS = ["微信支付", "支付宝支付"];

// 折扣绶带 · primary 派生渐变
const RIBBON_STYLE = {
  background:
    "linear-gradient(90deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 70%, black) 100%)",
};

function PackageCard({ pkg, active, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={cn(
        "relative flex flex-col overflow-hidden rounded-md border bg-card text-left skeu-raised skeu-interactive",
        active ? "border-primary" : "border-border"
      )}
    >
      {/* 折扣绶带 */}
      <span
        className="self-start rounded-br-md px-2.5 py-1 text-[11px] font-medium text-primary-foreground"
        style={RIBBON_STYLE}
      >
        618特惠折上折：{pkg.off}
      </span>
      {/* 选中角标 */}
      {active && (
        <span className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="size-3.5" strokeWidth={3} />
        </span>
      )}

      <div className="flex flex-col items-center gap-2 px-4 py-5">
        <span className="inline-flex items-center gap-1.5 text-3xl font-semibold tracking-tight text-foreground">
          <Coins className="size-6 text-primary" />
          {pkg.credits}
        </span>
        <p className="text-lg font-semibold text-foreground">
          ¥{pkg.price}
          <span className="ml-1.5 text-xs font-normal text-muted-foreground line-through">
            原价¥{pkg.original}
          </span>
        </p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          <span className="font-medium text-primary">到手{pkg.off}：</span>
          {pkg.note}
        </p>
      </div>

      <p className="w-full bg-primary/10 px-3 py-2 text-center text-xs text-foreground">
        GEO：AI平台最低约<span className="font-semibold text-primary">{pkg.per}元</span>起
      </p>
    </button>
  );
}

function CreditsPurchaseDialog({ open, onOpenChange, balance = 0 }) {
  const [pkgIndex, setPkgIndex] = useState(0);
  const [payment, setPayment] = useState(PAYMENTS[0]);
  const pkg = PACKAGES[pkgIndex];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] gap-0 overflow-y-auto overscroll-contain p-0 sm:max-w-5xl">
        <DialogHeader className="border-b border-border px-6 py-4">
          <div className="flex flex-wrap items-center gap-4 pr-8">
            <DialogTitle className="text-lg font-semibold text-foreground">
              购买积分
            </DialogTitle>
            <span className="ml-auto inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              我的积分
              <Coins className="size-4 text-primary" />
              <span className="font-semibold tabular-nums text-foreground">
                {balance}
              </span>
            </span>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-6 px-6 py-6">
            {/* 套餐 4 档 */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {PACKAGES.map((p, i) => (
                <PackageCard
                  key={p.credits}
                  pkg={p}
                  active={i === pkgIndex}
                  onSelect={() => setPkgIndex(i)}
                />
              ))}
            </div>

            {/* 支付区 · 左二维码占位 / 右支付方式与金额 */}
            <div className="grid gap-6 sm:grid-cols-[16rem_1fr]">
              <div className="flex aspect-square flex-col items-center justify-center gap-3 rounded-md border border-dashed border-border bg-muted/40 skeu-inset">
                <QrCode className="size-16 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">支付二维码占位</p>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm text-muted-foreground">支付方式</span>
                  {PAYMENTS.map((name) => (
                    <Button
                      key={name}
                      type="button"
                      variant="outline"
                      size="sm"
                      aria-pressed={payment === name}
                      onClick={() => setPayment(name)}
                      className={cn(
                        payment === name && "border-primary text-primary"
                      )}
                    >
                      {payment === name && <Check className="size-3.5" />}
                      {name}
                    </Button>
                  ))}
                </div>

                <dl className="flex flex-col gap-2 text-sm">
                  <div className="flex items-center gap-6">
                    <dt className="w-16 text-muted-foreground">积分原价</dt>
                    <dd className="text-muted-foreground line-through">
                      ¥{pkg.original}
                    </dd>
                  </div>
                  <div className="flex items-center gap-6">
                    <dt className="w-16 text-muted-foreground">优惠活动</dt>
                    <dd className="text-foreground">
                      ¥{pkg.price}
                      <span className="ml-4 text-muted-foreground">
                        到手{pkg.off}：{pkg.note}，已减{pkg.original - pkg.price}
                      </span>
                    </dd>
                  </div>
                </dl>

                <div className="mt-2">
                  <p className="text-sm text-muted-foreground">应付金额</p>
                  <p className="mt-1 text-4xl font-semibold tracking-tight text-primary">
                    <span className="mr-1 text-xl">¥</span>
                    {pkg.price}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    请在 <span className="font-medium text-destructive">14分59秒</span>{" "}
                    内完成支付
                  </p>
                </div>
              </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CreditsPurchaseDialog;
