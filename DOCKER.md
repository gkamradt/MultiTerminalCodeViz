# Docker 部署指南

本文档介绍如何使用 Docker 运行 MultiTerminal CodeViz 应用。

## 快速开始

### 生产环境部署

1. **使用 docker-compose 运行（推荐）**
   ```bash
   # 构建并启动应用
   docker-compose up -d
   
   # 查看日志
   docker-compose logs -f
   
   # 停止应用
   docker-compose down
   ```

2. **直接使用 Docker 运行**
   ```bash
   # 构建镜像
   docker build -t multiterminal-codeviz .
   
   # 运行容器
   docker run -d -p 3000:80 --name multiterminal-codeviz multiterminal-codeviz
   ```

应用将在 http://localhost:3000 上运行。

### 开发环境

如果您想在 Docker 中进行开发：

```bash
# 启动开发环境
docker-compose --profile dev up -d app-dev

# 查看开发服务器日志
docker-compose logs -f app-dev
```

开发服务器将在 http://localhost:5173 上运行，支持热重载。

## 配置选项

### 环境变量

- `NODE_ENV`: 设置为 `production` 或 `development`
- `VITE_HOST`: 开发环境下的主机地址（默认 0.0.0.0）

### 端口配置

您可以通过修改 `docker-compose.yml` 中的端口映射来更改应用端口：

```yaml
ports:
  - "8080:80"  # 将应用映射到端口 8080
```

## 故障排除

### 常见问题

1. **端口冲突**
   ```bash
   # 检查端口使用情况
   lsof -i :3000
   
   # 或者更改 docker-compose.yml 中的端口映射
   ```

2. **构建失败**
   ```bash
   # 清理 Docker 缓存
   docker system prune -a
   
   # 重新构建
   docker-compose build --no-cache
   ```

3. **容器无法启动**
   ```bash
   # 查看容器日志
   docker-compose logs app
   
   # 检查容器状态
   docker-compose ps
   ```

### 健康检查

应用包含健康检查功能，您可以通过以下方式检查应用状态：

```bash
# 检查容器健康状态
docker-compose ps

# 手动健康检查
docker exec multiterminal-codeviz wget --no-verbose --tries=1 --spider http://localhost:80
```

## 性能优化

### 生产环境优化

1. **Nginx 配置**: Dockerfile 中已包含优化的 Nginx 配置，包括：
   - Gzip 压缩
   - 静态资源缓存
   - 安全头设置

2. **多阶段构建**: 使用多阶段构建减小最终镜像大小

3. **资源限制**: 可以在 docker-compose.yml 中添加资源限制：
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '0.5'
         memory: 512M
   ```

## 维护

### 更新应用

```bash
# 拉取最新代码
git pull

# 重新构建并启动
docker-compose up -d --build
```

### 清理

```bash
# 停止并删除容器
docker-compose down

# 删除镜像
docker rmi multiterminal-codeviz

# 清理未使用的 Docker 资源
docker system prune
```

## 安全注意事项

1. 在生产环境中，建议使用反向代理（如 Nginx 或 Traefik）
2. 启用 HTTPS
3. 定期更新基础镜像
4. 使用非 root 用户运行容器（如需要）

## 支持

如果您遇到问题，请：
1. 检查日志：`docker-compose logs`
2. 验证配置：`docker-compose config`
3. 提交 Issue 到项目仓库
