#!/bin/bash
echo "🧹 Cleaning up Docker environment..."

echo "⏹️  Stopping all running containers..."
sudo docker stop $(sudo docker ps -q) 2>/dev/null || echo "No running containers to stop"

echo "🗑️  Removing all containers..."
sudo docker rm $(sudo docker ps -aq) 2>/dev/null || echo "No containers to remove"

# echo "🖼️  Removing all images..."
# sudo docker rmi $(sudo docker images -q) 2>/dev/null || echo "No images to remove"

# echo "🧽 Pruning Docker system..."
# sudo docker system prune -af --volumes

echo "⬇️  Stopping docker-compose services..."
sudo docker-compose down --volumes --remove-orphans

echo "🔨 Building and starting services..."
sudo docker-compose up --build -d

echo "✅ Docker Compose PostgresDB Complete!"

bunx prisma migrate dev

bunx prisma generate

bun run dev