/**
 * [INPUT]: 依赖 ui/Dialog + Tabs + Input + Label + Button，contexts/AuthContext，react-router-dom useNavigate，lucide 图标
 * [OUTPUT]: 受控 LoginDialog (open / onOpenChange)，公众号二维码 mock 登录 + 手机号验证码 mock 登录 · 登录成功 navigate('/dashboard')
 * [POS]: components/auth 单一登录入口，被 layout/Header 唯一消费 (桌面 + 移动登录按钮共用)
 * [PROTOCOL]: 仅做前端 mock 登录；真实接入时替换 AuthContext.login()
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Loader2, QrCode, Send, Smartphone } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/AuthContext'

const MOCK_CODE = '246810'
const QR_PATTERN = [
  1, 1, 1, 0, 1, 0, 1, 1, 1,
  1, 0, 1, 0, 0, 1, 1, 0, 1,
  1, 1, 1, 1, 0, 0, 1, 1, 1,
  0, 1, 0, 1, 1, 1, 0, 1, 0,
  1, 0, 1, 0, 1, 0, 1, 0, 1,
  0, 1, 1, 1, 0, 1, 1, 1, 0,
  1, 1, 1, 0, 1, 1, 1, 0, 1,
  1, 0, 1, 1, 0, 0, 1, 1, 0,
  1, 1, 1, 0, 1, 0, 0, 1, 1,
]

function MockQrCode() {
  return (
    <div className="mx-auto grid size-40 grid-cols-9 gap-1 rounded-md border border-border bg-background p-3 skeu-inset">
      {QR_PATTERN.map((filled, index) => (
        <span
          key={index}
          className={filled ? 'rounded-sm bg-foreground' : 'rounded-sm bg-muted'}
        />
      ))}
    </div>
  )
}

function LoginDialog({ open, onOpenChange }) {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [phone, setPhone] = useState('138 0000 0003')
  const [code, setCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const normalizedPhone = phone.replace(/\D/g, '')
  const canSendCode = normalizedPhone.length === 11 && !loading
  const canPhoneLogin = canSendCode && code.trim().length > 0

  const completeLogin = async (payload) => {
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 450))
    await login(payload)
    setLoading(false)
    onOpenChange?.(false)
    navigate('/dashboard')
  }

  const handleQrLogin = () => {
    completeLogin({ account: 'admin', loginType: 'wechat-official-account' })
  }

  const handleSendCode = () => {
    if (!canSendCode) return
    setCodeSent(true)
    setCode(MOCK_CODE)
  }

  const handlePhoneSubmit = (event) => {
    event.preventDefault()
    if (!canPhoneLogin) return
    completeLogin({ phone: normalizedPhone, code, loginType: 'sms-code' })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>登录火山 GEO</DialogTitle>
          <DialogDescription>
            使用公众号扫码或手机号验证码进入控制台。
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="wechat" className="py-2">
          <TabsList className="grid h-10 w-full grid-cols-2">
            <TabsTrigger value="wechat" className="gap-2">
              <QrCode className="size-4" />
              公众号扫码
            </TabsTrigger>
            <TabsTrigger value="phone" className="gap-2">
              <Smartphone className="size-4" />
              手机验证码
            </TabsTrigger>
          </TabsList>

          <TabsContent value="wechat" className="mt-4">
            <div className="grid gap-4 rounded-md border border-border bg-card p-4 text-center">
              <MockQrCode />
              <div className="grid gap-1">
                <p className="text-sm font-medium text-foreground">
                  扫描公众号二维码登录
                </p>
                <p className="text-xs text-muted-foreground">
                  关注公众号后确认授权，即可进入火山 GEO 控制台。
                </p>
              </div>
              <Button
                type="button"
                className="w-full"
                disabled={loading}
                leftIcon={loading ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
                onClick={handleQrLogin}
              >
                {loading ? '登录中…' : '已扫码并确认授权'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="phone" className="mt-4">
            <form onSubmit={handlePhoneSubmit} className="grid gap-4 rounded-md border border-border bg-card p-4">
              <div className="grid gap-2">
                <Label htmlFor="login-phone">手机号码</Label>
                <div className="relative">
                  <Smartphone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="login-phone"
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="138 0000 0003"
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="login-code">验证码</Label>
                <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                  <Input
                    id="login-code"
                    inputMode="numeric"
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    placeholder="输入 6 位验证码"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    leftIcon={<Send />}
                    disabled={!canSendCode}
                    onClick={handleSendCode}
                  >
                    获取验证码
                  </Button>
                </div>
                {codeSent && (
                  <p className="text-xs text-muted-foreground">
                    验证码已发送，本地演示已自动填入 {MOCK_CODE}。
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={!canPhoneLogin || loading}
                className="w-full"
                leftIcon={loading ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
              >
                {loading ? '登录中…' : '手机号登录'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

export default LoginDialog
