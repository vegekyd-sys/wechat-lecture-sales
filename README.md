# 微信在线培训课客服系统

基于 Claude AI 的在线培训课程智能客服，支持 H5 网页版和微信公众号接入。

## 项目结构

```
├── public/             # H5 前端页面
│   └── index.html      # 聊天界面
├── server/             # 后端服务
│   ├── index.js        # Express 服务入口
│   └── chat.js         # Claude API 调用
├── skills/             # 客服 Skill 知识库
│   └── customer-service.md  # 客服话术与策略
├── .env.example        # 环境变量示例
└── package.json
```

## 快速开始

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env，填入你的 ANTHROPIC_API_KEY

# 启动服务
ANTHROPIC_API_KEY=your-key npm start
```

浏览器打开 `http://localhost:3000` 即可测试。

## 技术栈

- **前端**: 原生 HTML5 + CSS3 + JavaScript（微信风格 UI）
- **后端**: Node.js + Express
- **AI**: Claude Sonnet (Anthropic API)
- **客服策略**: Markdown Skill 文件，易于编辑和维护
