/**
 * [INPUT]: 依赖 lib/mock-rbac 的前端演示数据
 * [OUTPUT]: 系统设置模块的 mock 数据与工具转发
 * [POS]: pages/dashboard/system 私有入口，兼容 Users/Roles 及其表单的既有 import
 * [PROTOCOL]: RBAC mock 单一真相在 lib/mock-rbac；本文件不再维护独立副本
 */
export {
  COMPANIES,
  MENU_TREE,
  MENU_KEYS,
  BUTTON_ACTIONS,
  DEFAULT_BUTTON_PERMISSIONS,
  PERMISSION_CATALOG,
  INITIAL_ROLES,
  INITIAL_USERS,
  emptyPermissions,
  fullPermissions,
  companyNames,
  countRoleUsers,
} from '@/lib/mock-rbac'
