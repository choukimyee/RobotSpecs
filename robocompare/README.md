# RoboCompare - 机器人参数对比平台

专业的机器人产品参数对比平台，帮助用户快速了解和比较不同品牌、型号机器人的详细规格。

![RoboCompare](https://via.placeholder.com/1200x630/007AFF/FFFFFF?text=RoboCompare)

## ✨ 功能特点

- 🤖 **多品类支持** - 人形机器人、四足机器狗、灵巧手等多种机器人品类
- 📊 **参数对比** - 支持 2-10 个产品横向对比，自动高亮最优参数
- 📱 **响应式设计** - 完美适配桌面端和移动端
- 🎨 **Apple 风格 UI** - 现代简约的用户界面
- 🔍 **智能抓取** - 从产品链接自动提取参数信息
- 📥 **CSV 导入导出** - 批量管理产品数据
- 🔗 **分享功能** - 生成对比结果分享链接
- 🌐 **多语言** - 支持中英文切换（开发中）
- 👥 **用户系统** - 完整的用户注册、登录和权限管理

## 🛠 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **UI 组件**: Radix UI
- **数据库**: MongoDB
- **状态管理**: Zustand
- **部署**: Vercel

## 🚀 快速开始

### 环境要求

- Node.js 18+
- MongoDB (推荐使用 MongoDB Atlas)

### 安装步骤

1. **克隆项目**

```bash
git clone https://github.com/yourusername/robocompare.git
cd robocompare
```

2. **安装依赖**

```bash
npm install
```

3. **配置环境变量**

复制 `.env.example` 为 `.env.local` 并填写配置：

```bash
cp .env.example .env.local
```

编辑 `.env.local`：

```env
# MongoDB 连接字符串 (MongoDB Atlas)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/robocompare?retryWrites=true&w=majority

# NextAuth 配置
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-change-in-production
```

4. **初始化数据库（可选）**

运行种子脚本预置品类和模板：

```bash
npm run seed
```

5. **启动开发服务器**

```bash
npm run dev
```

访问 http://localhost:3000

## 📁 项目结构

```
robocompare/
├── src/
│   ├── app/                 # Next.js App Router 页面
│   │   ├── api/            # API 路由
│   │   ├── admin/          # 管理后台页面
│   │   ├── category/       # 品类页面
│   │   ├── compare/        # 对比页面
│   │   ├── login/          # 登录页面
│   │   ├── register/       # 注册页面
│   │   └── share/          # 分享页面
│   ├── components/         # React 组件
│   │   ├── layout/         # 布局组件
│   │   └── ui/             # UI 基础组件
│   ├── lib/                # 工具函数
│   ├── models/             # MongoDB 数据模型
│   ├── store/              # Zustand 状态管理
│   └── types/              # TypeScript 类型定义
├── public/                  # 静态资源
└── ...
```

## 🔑 API 接口

### 品类管理

- `GET /api/categories` - 获取品类列表
- `POST /api/categories` - 创建品类
- `PUT /api/categories/:id` - 更新品类
- `DELETE /api/categories/:id` - 删除品类

### 模板管理

- `GET /api/templates` - 获取模板列表
- `POST /api/templates` - 创建模板
- `PUT /api/templates/:id` - 更新模板
- `DELETE /api/templates/:id` - 删除模板

### 产品管理

- `GET /api/products` - 获取产品列表
- `POST /api/products` - 创建产品
- `PUT /api/products/:id` - 更新产品
- `DELETE /api/products/:id` - 删除产品
- `POST /api/products/transfer` - 批量转移品类

### 对比与分享

- `POST /api/compare` - 获取对比数据
- `POST /api/compare/share` - 创建分享链接
- `GET /api/compare/share?id=xxx` - 获取分享数据

### 数据导入导出

- `POST /api/import` - CSV 导入
- `GET /api/export` - CSV 导出
- `POST /api/scrape` - 链接抓取

### 用户认证

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出
- `GET /api/auth/me` - 获取当前用户

## 🚢 部署到 Vercel

1. 在 [Vercel](https://vercel.com) 导入项目
2. 配置环境变量
3. 部署完成

## 📝 开发计划

- [x] MVP 核心功能
- [x] 品类和模板管理
- [x] 产品管理和对比
- [x] 链接抓取
- [x] CSV 导入导出
- [x] 用户认证
- [x] 分享功能
- [ ] 第三方登录（微信/Google）
- [ ] 多语言切换
- [ ] 深色模式
- [ ] 图片上传（OSS）
- [ ] SEO 优化

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

Made with ❤️ by RoboCompare Team
