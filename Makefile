# Makefile for MultiTerminal CodeViz

.PHONY: help build up down logs clean dev dev-down restart

# 默认目标
help:
	@echo "可用的命令："
	@echo "  build     - 构建 Docker 镜像"
	@echo "  up        - 启动生产环境应用"
	@echo "  down      - 停止应用"
	@echo "  logs      - 查看应用日志"
	@echo "  dev       - 启动开发环境"
	@echo "  dev-down  - 停止开发环境"
	@echo "  restart   - 重启应用"
	@echo "  clean     - 清理 Docker 资源"
	@echo "  test      - 运行测试"

# 构建镜像
build:
	docker-compose build

# 启动生产环境
up:
	docker-compose up -d
	@echo "应用已启动，访问 http://localhost:3000"

# 停止应用
down:
	docker-compose down

# 查看日志
logs:
	docker-compose logs -f

# 启动开发环境
dev:
	docker-compose --profile dev up -d app-dev
	@echo "开发环境已启动，访问 http://localhost:5173"

# 停止开发环境
dev-down:
	docker-compose --profile dev down

# 重启应用
restart: down up

# 清理 Docker 资源
clean:
	docker-compose down -v
	docker system prune -f

# 运行测试
test:
	docker-compose exec app npm test
