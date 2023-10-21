if command -v node &> /dev/null; then
    node_version=$(node -v)
    echo "✅ Node.js is installed (Version: $node_version)"
else
    echo "❗️ Node.js is not installed"
fi

if docker image inspect postgres:15-alpine &> /dev/null; then
    echo "✅ Docker image 'postgres:15-alpine' is available"
else
    echo "❗️ Docker image 'postgres:15-alpine' is not available. Please pull the image"
fi

if command -v git &> /dev/null; then
    echo "✅ Git is installed"
else
    echo "❗️ Git is not installed. It may be needed to complete the workshop"
fi

if command -v gcloud &> /dev/null; then
    echo "✅ Google Cloud CLI (gcloud) is installed"
else
    echo "❗️ Google Cloud CLI (gcloud) is not installed. It is needed to complete the workshop"
fi

if command -v neonctl &> /dev/null; then
    neonctl_version=$(neonctl -v)
    echo "✅ Neon CLI (neonctl) is installed (Version: $neonctl_version)"
else
    echo "❗️ Neon CLI (neonctl) is not installed. Install it with 'npm install -g neonctl'"
fi

echo "💡 A https://platformatic.cloud/ account is needed to complete the workshop"
echo "💡 A https://telegram.org/ account is also needed to complete the workshop"

echo "\n🎉 Self-checkup completed"