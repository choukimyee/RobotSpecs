import Link from 'next/link'
import { 
  LayoutDashboard, 
  FolderTree, 
  FileText, 
  Package, 
  Users, 
  Upload, 
  Download,
  Bot
} from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const navItems = [
    { href: '/admin', icon: LayoutDashboard, label: '仪表盘' },
    { href: '/admin/categories', icon: FolderTree, label: '品类管理' },
    { href: '/admin/templates', icon: FileText, label: '模板管理' },
    { href: '/admin/products', icon: Package, label: '产品管理' },
    { href: '/admin/users', icon: Users, label: '用户管理' },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 侧边栏 */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="flex h-16 items-center border-b border-gray-200 px-6 dark:border-gray-800">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold">管理后台</span>
          </Link>
        </div>
        
        <nav className="space-y-1 p-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* 主内容区 */}
      <div className="ml-64 flex-1">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 dark:border-gray-800 dark:bg-gray-900">
          <div />
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            返回前台
          </Link>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
