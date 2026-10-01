#!/usr/bin/env bash
# Ensure Docker daemon is running in this sandbox (no systemd).
# Uses vfs storage + iptables-legacy (required for container ICC here).
set -euo pipefail

if docker info >/dev/null 2>&1; then
  echo "Docker already running ($(docker info -f '{{.Driver}}'))."
  exit 0
fi

echo "Preparing iptables-legacy + dockerd…"
sudo mkdir -p /etc/docker
sudo update-alternatives --set iptables /usr/sbin/iptables-legacy >/dev/null 2>&1 || true
sudo update-alternatives --set ip6tables /usr/sbin/ip6tables-legacy >/dev/null 2>&1 || true
sudo sysctl -w net.ipv4.ip_forward=1 >/dev/null 2>&1 || true
sudo tee /etc/docker/daemon.json >/dev/null <<'EOF'
{
  "storage-driver": "vfs",
  "iptables": true,
  "ip-forward": true
}
EOF

nohup sudo dockerd --host=unix:///var/run/docker.sock >/tmp/dockerd.log 2>&1 &
for _ in $(seq 1 40); do
  if [[ -S /var/run/docker.sock ]] && docker info >/dev/null 2>&1; then
    sudo chmod 666 /var/run/docker.sock 2>/dev/null || true
    # Nested VM: Docker bridge ICC often needs an explicit FORWARD accept
    sudo iptables -C FORWARD -j ACCEPT 2>/dev/null || sudo iptables -I FORWARD -j ACCEPT
    sudo iptables -C DOCKER-USER -j ACCEPT 2>/dev/null || sudo iptables -I DOCKER-USER -j ACCEPT 2>/dev/null || true
    echo "Docker is up ($(docker info -f '{{.Driver}}'))."
    exit 0
  fi
  sleep 1
done
echo "Failed to start Docker. See /tmp/dockerd.log"
tail -50 /tmp/dockerd.log || true
exit 1
