# 项目概览：在线培训课程 AI 客服系统

## 产品定位

面向在线培训课程销售转化的 H5 聊天界面，AI 扮演客服顾问角色，帮助潜在学员了解课程、解答疑问、引导报名。

不接入微信，作为独立 H5 页面运行。

## 技术架构

| 层级 | 技术 |
|------|------|
| 前端 | 原生 HTML5 + CSS3 + JS，微信风格 UI |
| 后端 | Node.js + Express |
| AI 接口 | Kimi（Moonshot AI），`moonshot-v1-128k` 模型 |
| 部署 | 支持本地运行 & Vercel Serverless 部署 |

## 项目结构

```
├── public/
│   └── index.html              # H5 聊天界面（前端）
├── server/
│   ├── index.js                # Express 服务入口（本地运行）
│   └── chat.js                 # Kimi API 调用封装
├── api/
│   └── chat.js                 # Vercel Serverless Function（生产部署）
├── skills/
│   └── customer-service.md     # 客服 Skill 知识库（系统提示词）
├── .env.example                # 环境变量示例
├── vercel.json                 # Vercel 路由配置
└── package.json
```

## 核心逻辑

- `POST /api/chat`：前端发送对话历史（messages 数组），后端读取 `skills/customer-service.md` 作为系统提示词，调用 Kimi API 返回 AI 回复
- 两套后端实现共存：`server/chat.js`（本地）和 `api/chat.js`（Vercel），逻辑相同

## 环境变量

| 变量 | 说明 |
|------|------|
| `MOONSHOT_API_KEY` | Kimi（Moonshot AI）API Key（必填） |
| `MODEL` | 模型名称，默认 `moonshot-v1-128k` |
| `PORT` | 本地端口，默认 `3000` |

## 客服 Skill（`skills/customer-service.md`）

定义了 AI 客服的角色、课程体系（示例数据，需替换为实际课程）、对话策略（欢迎→了解需求→推荐→处理异议→促成转化）、FAQ、回复规范和数据埋点事件。

## 本地运行

```bash
npm install
cp .env.example .env
# 填入 MOONSHOT_API_KEY
npm start
# 访问 http://localhost:3000
```

## 当前状态

- [x] 基础架构搭建完成
- [x] Kimi API 接入完成
- [x] Vercel 部署支持
- [ ] 前端 H5 界面（`public/index.html`，待确认完成度）
- [ ] 客服 Skill 内容需替换为实际课程信息
