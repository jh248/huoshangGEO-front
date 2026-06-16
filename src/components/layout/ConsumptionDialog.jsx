/**
 * [INPUT]: 依赖 lucide-react、ui/Dialog+Badge+ScrollArea+Table、lib/utils cn
 * [OUTPUT]: 默认导出 ConsumptionDialog — 消费明细弹窗 (明细列表: 消耗时间/问题数量/消耗积分/剩余积分)
 *           受控 props: { open, onOpenChange }
 * [POS]: components/layout 子件，由 Header 用户下拉菜单「消费明细」唤起
 * [PROTOCOL]: 前端原型 — 明细为 mock，接入后端后从接口取数；颜色仅用 token，禁止 hex
 */
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// 消费明细 mock · cost=消耗积分 / questions=问题数量 / time=消耗时间 / balance=剩余积分
const RECORDS = [
  { cost: 51, questions: 5, time: "2026-06-11 14:32", balance: 17.8 },
  { cost: 24, questions: 3, time: "2026-06-11 10:05", balance: 68.8 },
  { cost: 34, questions: 4, time: "2026-06-10 16:48", balance: 92.8 },
  { cost: 15, questions: 2, time: "2026-06-10 09:12", balance: 126.8 },
  { cost: 17, questions: 2, time: "2026-06-09 18:20", balance: 141.8 },
  { cost: 68, questions: 8, time: "2026-06-08 11:00", balance: 158.8 },
];

function ConsumptionDialog({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle className="text-lg font-semibold text-foreground">
            消费明细
          </DialogTitle>
          <DialogDescription className="sr-only">
            积分充值与消耗的历史明细列表
          </DialogDescription>
        </DialogHeader>

        {/* 明细列表 */}
        <ScrollArea className="max-h-[60vh]">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6 text-muted-foreground">消耗时间</TableHead>
                <TableHead className="text-muted-foreground">问题数量</TableHead>
                <TableHead className="text-muted-foreground">消耗积分</TableHead>
                <TableHead className="pr-6 text-right text-muted-foreground">
                  剩余积分
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {RECORDS.map((r) => (
                <TableRow key={r.time}>
                  <TableCell className="pl-6 text-xs tabular-nums text-muted-foreground">
                    {r.time}
                  </TableCell>
                  <TableCell className="text-sm tabular-nums text-foreground">
                    {r.questions}
                  </TableCell>
                  <TableCell className="text-sm font-semibold tabular-nums text-foreground">
                    -{r.cost}
                  </TableCell>
                  <TableCell className="pr-6 text-right text-sm tabular-nums text-muted-foreground">
                    {r.balance}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default ConsumptionDialog;
