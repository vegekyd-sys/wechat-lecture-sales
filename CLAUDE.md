# 项目概览：OSM 大阪音乐专门学校 AI 客服系统

## 产品定位

面向 OSM 大阪スクールオブミュージック専門学校招生转化的 H5 页面，包含文字聊天和语音通话两种交互方式。AI 扮演招生顾问角色，帮助潜在学员了解课程、解答疑问、引导报名体验。

独立 H5 页面，不接入微信。支持日语/中文/英语三语。

## 技术架构

| 层级 | 技术 |
|------|------|
| 前端 | 原生 HTML5 + CSS3 + JS，多语言 UI |
| 后端 | Node.js + Express |
| 文字聊天 AI | Kimi（Moonshot AI），`moonshot-v1-128k` 模型 |
| 语音通话 AI | Google Gemini Live API，`gemini-2.5-flash-native-audio-latest` 模型 |
| 部署 | 支持本地运行 & Vercel Serverless 部署 |

## 项目结构

```
├── public/
│   ├── index.html              # H5 界面（聊天 + 语音通话）
│   ├── pcm-worklet.js          # AudioWorklet 麦克风采集（16-bit PCM）
│   └── voice-service.md        # 语音客服知识库（前端加载）
├── server/
│   ├── index.js                # Express 服务入口（本地运行）
│   └── chat.js                 # Kimi API 调用封装
├── api/
│   ├── chat.js                 # Vercel Serverless - 文字聊天
│   └── voice-token.js          # Vercel Serverless - 语音 API Key
├── skills/
│   ├── customer-service.md     # 文字聊天知识库（服务端加载）
│   └── voice-service.md        # 语音客服知识库（源文件，同步到 public/）
├── .env.example                # 环境变量示例
├── vercel.json                 # Vercel 路由配置
└── package.json
```

## 核心逻辑

### 文字聊天
- `POST /api/chat`：前端发送对话历史（messages 数组），后端读取 `skills/customer-service.md` 作为系统提示词，调用 Kimi API 流式返回 AI 回复
- 两套后端实现共存：`server/chat.js`（本地）和 `api/chat.js`（Vercel），逻辑相同

### 语音通话
- 前端直连 Gemini Live WebSocket API（`wss://generativelanguage.googleapis.com`）
- `GET /api/voice-token`：返回 Google API Key 给前端建立 WebSocket
- 麦克风音频通过 AudioWorklet 采集，降采样到 16kHz 16-bit PCM 发送
- 服务端返回 24kHz PCM 音频通过 AudioContext 播放
- 系统指令从 `public/voice-service.md` 加载
- 支持 `end_call` 工具调用：用户说再见时 AI 自动结束通话
- 支持 `goAway` 消息处理：会话超时友好提示

## 环境变量

| 变量 | 说明 |
|------|------|
| `MOONSHOT_API_KEY` | Kimi（Moonshot AI）API Key（文字聊天，必填） |
| `GOOGLE_API_KEY` | Google Gemini API Key（语音通话，必填） |
| `MODEL` | Kimi 模型名称，默认 `moonshot-v1-128k` |
| `PORT` | 本地端口，默认 `3000` |

## 知识库

- `skills/customer-service.md`：文字聊天用，完整的 OSM 学校信息、7 大领域 43 专业详情、对话策略、FAQ、回复规范
- `skills/voice-service.md` / `public/voice-service.md`：语音通话用，精简版（~1.6KB），保留关键信息但压缩细节以减少 token 消耗延长通话时间

## 本地运行

```bash
npm install
cp .env.example .env
# 填入 MOONSHOT_API_KEY 和 GOOGLE_API_KEY
npm start
# 访问 http://localhost:3000
```

## 调试

- 语音通话调试日志默认隐藏，在 URL 加 `?vcdebug` 显示调试面板
- 日志也输出到浏览器 console（`[VC]` 前缀）

## 注意事项

- `voice-service.md` 在 `skills/` 和 `public/` 各有一份，修改后需同步（`public/` 是前端实际加载的版本）
- Gemini Live API 有会话时长限制（约 10-15 分钟），超时会收到 `goAway` 或 WS 断开
- 语音通话需要 HTTPS 环境（麦克风权限要求），本地开发用 localhost 可绕过

## 当前状态

- [x] 基础架构搭建完成
- [x] Kimi 文字聊天 API 接入完成
- [x] Vercel 部署支持
- [x] 前端 H5 界面（多语言聊天 UI）
- [x] 客服知识库（OSM 学校完整信息）
- [x] Gemini Live 语音通话功能
- [x] AI 自动结束通话（end_call 工具）
- [x] 调试面板可隐藏
