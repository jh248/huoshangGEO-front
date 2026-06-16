/**
 * [INPUT]: permissionKey, children, AuthContext user
 * [OUTPUT]: 权限路由守卫；无查看权限时渲染无权限提示
 * [POS]: components/auth，被 App.jsx 用于保护需要 RBAC 的子路由
 * [PROTOCOL]: 前端 mock 守卫只负责演示体验；真实安全仍需后端鉴权
 */
import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { canView } from '@/lib/mock-rbac'

function RequirePermission({ permissionKey, children }) {
  const { user } = useAuth()

  if (canView(user, permissionKey)) return children

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <Alert>
        <ShieldAlert className="size-4" />
        <AlertTitle>无权限访问</AlertTitle>
        <AlertDescription>
          当前账号「{user?.role ?? '未分配角色'}」没有此页面的查看权限。请切换系统总管理员账号，或在角色权限中调整该角色。
        </AlertDescription>
      </Alert>
      <Button asChild variant="outline" className="w-fit">
        <Link to="/dashboard/data/overview">返回数据总览</Link>
      </Button>
    </div>
  )
}

export default RequirePermission
