#!/usr/bin/env bash
# Ensure Docker daemon is running in this sandbox (no systemd).
set -euo pipefail

if docker info >/dev/null 2>&1; then
  echo "Docker already running."
  exit 0
fi

echo "Starting dockerd…"
sudo mkdir -p /var/run
sudo dockerd --host=unix:///var/run/docker.sock --iptables=false >/tmp/dockerd.log 2>&1 &
for i in $(seq 1 30); do
  if docker info >/dev/null 2>&1; then
    sudo chmod 666 /var/run/docker.sock 2>/dev/null || true
    echo "Docker is up."
    exit 0
  fi
  sleep 1
done
echo "Failed to start Docker. See /tmp/dockerd.log"
tail -50 /tmp/dockerd.log || true
exit 1
