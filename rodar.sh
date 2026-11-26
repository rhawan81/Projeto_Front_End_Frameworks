#!/usr/bin/env bash
set -e

cd "$(dirname "$0")"

echo "=========================================="
echo "  Iniciando Organizador de Estudos (AV2)  "
echo "=========================================="

# 1. Garante arquivo .env
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
  cp .env.example .env
  echo "[OK] Arquivo .env criado a partir do .env.example"
fi

# 2. Garante dependencias do Front-end
if [ ! -d "node_modules" ]; then
  echo "[1/4] Instalando dependencias do Front-end (npm install)..."
  npm install
else
  echo "[1/4] Dependencias do Front-end prontas."
fi

# 3. Garante Apache Maven para o Back-end Spring Boot
MAVEN_BASE="/c/tools-maven"
mkdir -p "$MAVEN_BASE" 2>/dev/null || MAVEN_BASE="$HOME"

if command -v mvn >/dev/null 2>&1; then
  MVN_CMD="mvn"
elif [ -x "$MAVEN_BASE/apache-maven-3.9.9/bin/mvn" ]; then
  MVN_CMD="$MAVEN_BASE/apache-maven-3.9.9/bin/mvn"
elif [ -x "$HOME/apache-maven-3.9.9/bin/mvn" ]; then
  MVN_CMD="$HOME/apache-maven-3.9.9/bin/mvn"
else
  echo "[2/4] Baixando Apache Maven 3.9.9 automaticamente..."
  curl -fL "https://archive.apache.org/dist/maven/maven-3/3.9.9/binaries/apache-maven-3.9.9-bin.zip" -o "$MAVEN_BASE/maven.zip"
  unzip -qo "$MAVEN_BASE/maven.zip" -d "$MAVEN_BASE"
  rm -f "$MAVEN_BASE/maven.zip"
  MVN_CMD="$MAVEN_BASE/apache-maven-3.9.9/bin/mvn"
fi
echo "[2/4] Maven pronto: $MVN_CMD"

# 4. Gera JWT_SECRET valido em Base64 (32 bytes)
export JWT_SECRET="$(openssl rand -base64 32)"
echo "[3/4] JWT_SECRET gerado em Base64."

# Encerra o back-end automaticamente ao pressionar Ctrl+C
cleanup() {
  echo ""
  echo "Encerrando servidores..."
  if [ -n "$BACKEND_PID" ]; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

# 5. Sobe Back-end (8080) + Front-end (5173)
echo "[4/4] Subindo Back-end Spring Boot (8080) e Front-end Vite (5173)..."
(cd backend && "$MVN_CMD" spring-boot:run) &
BACKEND_PID=$!

npm run dev
