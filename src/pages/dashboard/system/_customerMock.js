/**
 * [INPUT]: 无外部依赖，纯前端演示数据
 * [OUTPUT]: 客户主体 mock 数据 (含 operatorUserIds 运营归属) + 类型/状态展示元信息
 * [POS]: pages/dashboard/system 私有 mock，被 Customers (客户管理) 与 Operations (运营管理) 共同消费
 * [PROTOCOL]: 运营→客户主体归属内嵌在 CUSTOMER_SUBJECTS.operatorUserIds；接真实接口时替换数据源即可
 */

export const CUSTOMER_SUBJECTS = [
  {
    id: 'c-huoshan',
    name: '火山 GEO',
    type: 'internal',
    website: 'www.huoshan-geo.cn',
    contactUserId: 'u-admin',
    operatorUserIds: [],
    serviceStatus: 'internal',
    serviceExpiresAt: '长期',
    dataScope: '平台内部数据',
  },
  {
    id: 'c-lixiang',
    name: '理想汽车',
    type: 'company',
    website: 'www.lixiang.com',
    contactUserId: 'u-zhao',
    operatorUserIds: ['u-lin'],
    serviceStatus: 'active',
    serviceExpiresAt: '2026/09/30',
    dataScope: '品牌 GEO 数据',
  },
  {
    id: 'c-nova',
    name: 'Nova SaaS',
    type: 'company',
    website: 'www.nova-saas.com',
    contactUserId: 'u-chen',
    operatorUserIds: ['u-lin'],
    serviceStatus: 'active',
    serviceExpiresAt: '2026/07/15',
    dataScope: '品牌 GEO 数据',
  },
  {
    id: 'c-aurora',
    name: '极光消费',
    type: 'company',
    website: 'www.aurora-fmcg.com',
    contactUserId: null,
    operatorUserIds: ['u-admin'],
    serviceStatus: 'expiring',
    serviceExpiresAt: '2026/06/30',
    dataScope: '品牌 GEO 数据',
  },
  {
    id: 'c-personal',
    name: '张三个人品牌',
    type: 'individual',
    website: 'xiaohongshu.com/user/example',
    contactUserId: null,
    operatorUserIds: ['u-lin'],
    serviceStatus: 'trial',
    serviceExpiresAt: '2026/06/20',
    dataScope: '个人账号 GEO 数据',
  },
]

export const CUSTOMER_TYPE_META = {
  company: { label: '企业客户', variant: 'secondary' },
  individual: { label: '个人客户', variant: 'outline' },
  internal: { label: '平台内部', variant: 'default' },
}

export const SERVICE_STATUS_META = {
  active: { label: '服务中', variant: 'accent' },
  trial: { label: '试用中', variant: 'secondary' },
  expiring: { label: '即将到期', variant: 'outline' },
  internal: { label: '内部', variant: 'default' },
}
