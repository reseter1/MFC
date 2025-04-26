#!/bin/bash
echo "Đang xóa toàn bộ Docker resources..."

echo "Dừng tất cả containers..."
docker stop $(docker ps -q) 2>/dev/null || true

echo "Xóa tất cả containers..."
docker rm -f $(docker ps -a -q) 2>/dev/null || true

echo "Xóa tất cả images..."
docker rmi -f $(docker images -q) 2>/dev/null || true

echo "Xóa tất cả volumes..."
docker volume rm -f $(docker volume ls -q) 2>/dev/null || true

echo "Xóa tất cả networks..."
docker network rm $(docker network ls -q) 2>/dev/null || true

echo "Xóa build cache..."
docker builder prune -af 2>/dev/null || true

echo "Đã xóa toàn bộ Docker resources!" 