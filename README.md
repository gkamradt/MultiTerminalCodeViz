# I Vibe More Than You

https://www.IVibeMoreThanYou.com/

This app is for fun - PRs welcome

A React app that displays multiple draggable and resizable terminal windows with animated typing effects. Each terminal shows different development scenarios with customizable themes and variable typing speeds.

## Quick Start

### 本地开发

```bash
git clone https://github.com/gkamradt/MultiTerminalCodeViz
npm install
npm run dev
```

### Docker 部署

#### 生产环境（推荐）

```bash
# 使用 docker-compose 一键启动
docker-compose up -d

# 应用将在 http://localhost:3000 运行
```

#### 开发环境

```bash
# 在 Docker 中进行开发
docker-compose --profile dev up -d app-dev

# 开发服务器将在 http://localhost:5173 运行，支持热重载
```

更多 Docker 相关信息请查看 [DOCKER.md](./DOCKER.md)