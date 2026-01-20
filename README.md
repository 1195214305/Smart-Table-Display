# Smart Table Display - 智能表格展示平台

基于阿里云ESA边缘计算的智能数据展示平台，支持Excel导入、实时滚屏播放、AI数据分析。

## 本项目由[阿里云ESA](https://www.aliyun.com/product/esa)提供加速、计算和保护

![阿里云ESA](https://img.alicdn.com/imgextra/i3/O1CN01H1UU3i1Cti9lYtFrs_!!6000000000139-2-tps-7534-844.png)

## 项目特色

### 创意卓越
- 现代暗黑科技风UI设计，摒弃传统蓝紫渐变
- 玻璃态效果和霓虹光晕，视觉效果出众
- 完美适配移动端，响应式设计

### 应用价值
- 快速导入Excel文件，无需复杂配置
- 支持自动滚屏播放，适合会议展示
- AI智能分析数据，提供洞察建议
- 用户可自定义千问API Key，数据隐私安全

### 技术探索
- 充分利用ESA边缘计算能力
- 边缘函数处理AI分析请求
- 边缘缓存优化响应速度
- 全球CDN加速静态资源

## How We Use Edge - 边缘计算的不可替代性

### 1. 边缘函数处理AI请求
传统方案需要部署后端服务器，而我们使用ESA边缘函数直接处理千问API调用：
- **零服务器运维**：无需购买和维护服务器
- **全球低延迟**：边缘节点就近处理请求
- **自动扩缩容**：根据流量自动调整资源

```javascript
// functions/index.js - 边缘函数处理AI分析
async function handleAnalyze(request, corsHeaders) {
  const { apiKey, data } = await request.json()

  // 在边缘节点调用千问API
  const qianwenResponse = await fetch('https://dashscope.aliyuncs.com/...', {
    headers: { 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model: 'qwen-turbo', input: data })
  })

  return new Response(JSON.stringify(result), { headers: corsHeaders })
}
```

### 2. 边缘缓存加速
- 静态资源通过ESA全球CDN分发
- 首次访问后缓存在边缘节点
- 后续访问直接从最近节点返回

### 3. 为什么边缘不可替代？

**传统方案的问题：**
- 需要购买云服务器（成本高）
- 需要配置Nginx/Node.js（运维复杂）
- 单地域部署，全球访问慢
- 流量突增时需要手动扩容

**ESA边缘方案的优势：**
- ✅ 零成本部署（无需服务器）
- ✅ 零运维负担（自动管理）
- ✅ 全球加速（边缘节点就近服务）
- ✅ 弹性伸缩（自动应对流量波动）

## 功能特性

- 📊 **Excel导入**：支持.xlsx和.xls格式
- 🎬 **自动滚屏**：可调节速度的无限循环播放
- 🎨 **自定义样式**：字体大小、颜色、背景可调
- 🤖 **AI数据分析**：集成千问API，智能洞察数据
- 💾 **本地存储**：设置自动保存到浏览器
- 📱 **移动适配**：完美支持手机和平板

## 技术栈

- **前端**：React 18 + TypeScript + Tailwind CSS
- **构建工具**：Vite 5
- **边缘计算**：阿里云ESA Pages + 边缘函数
- **AI能力**：阿里云千问大模型
- **Excel处理**：SheetJS (xlsx)

## 快速开始

### 本地开发

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 部署到ESA

1. 推送代码到GitHub
2. 在ESA控制台创建Pages项目
3. 选择GitHub仓库
4. 配置构建参数（使用esa.jsonc）
5. 部署完成

### 使用说明

1. **上传Excel文件**
   - 点击顶部"上传Excel"按钮
   - 选择.xlsx或.xls文件
   - 数据自动解析并展示

2. **配置千问API**
   - 点击设置按钮
   - 输入千问API Key（从阿里云控制台获取）
   - 保存设置

3. **AI数据分析**
   - 上传数据后点击"AI数据分析"
   - 系统自动调用千问API
   - 查看智能洞察结果

4. **自定义样式**
   - 调节滚动速度
   - 修改字体大小
   - 选择背景颜色

## 项目结构

```
Smart Table Display/
├── frontend/              # 前端代码
│   ├── src/
│   │   ├── App.tsx       # 主应用组件
│   │   ├── index.css     # 全局样式
│   │   └── main.tsx      # 入口文件
│   ├── package.json
│   └── vite.config.ts
├── functions/             # 边缘函数
│   └── index.js          # 统一入口（AI分析、健康检查）
├── esa.jsonc             # ESA配置文件
└── README.md
```

## 边缘函数API

### POST /api/analyze
AI数据分析接口

**请求体：**
```json
{
  "apiKey": "sk-xxx",
  "data": {
    "headers": ["列1", "列2"],
    "rows": [["值1", "值2"]]
  }
}
```

**响应：**
```json
{
  "insight": "数据分析结果..."
}
```

### GET /api/health
健康检查接口

**响应：**
```json
{
  "status": "ok",
  "timestamp": "2026-01-20T...",
  "edge": "aliyun-esa"
}
```

## 设计理念

### 避免"AI味儿"
- ❌ 不使用蓝紫渐变色
- ❌ 不滥用Emoji图标
- ❌ 不堆叠圆角卡片
- ✅ 采用暗黑科技风
- ✅ 使用玻璃态效果
- ✅ 霓虹色点缀（橙色+青色）

### 移动端优先
- 响应式布局
- 触摸友好的交互
- 适配小屏幕

## 开发者

- GitHub: [@1195214305](https://github.com/1195214305)
- 项目仓库: [Smart Table Display](https://github.com/1195214305/Smart%20Table%20Display)

## 许可证

MIT License

## 致谢

感谢阿里云ESA提供的强大边缘计算能力，让这个项目得以零成本、零运维地运行在全球边缘节点上。
