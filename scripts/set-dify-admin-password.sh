#!/usr/bin/env bash
# Set Dify console admin password from COLLAB_PASSWORD (never echo it).
# Usage: COLLAB_PASSWORD='…' ./scripts/set-dify-admin-password.sh
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib.sh"
load_lab_env

if [[ -z "${COLLAB_PASSWORD:-}" ]]; then
  echo "error: set COLLAB_PASSWORD in the environment (do not pass it as a CLI arg)." >&2
  exit 1
fi

if ! docker_daemon_ok; then
  echo "error: Docker daemon is not running." >&2
  exit 1
fi

echo "==> Hashing and storing Dify admin password for lab-admin@example.com (secret not logged)."

HASH_LINE="$(
  docker exec -e COLLAB_PASSWORD="${COLLAB_PASSWORD}" docker-api-1 python -c '
import base64, os, secrets, sys
from libs.password import hash_password, valid_password
password = os.environ.get("COLLAB_PASSWORD", "")
if not password:
    sys.exit(2)
valid_password(password)
salt = secrets.token_bytes(16)
hashed = hash_password(password, salt)
sys.stdout.write(base64.b64encode(hashed).decode() + " " + base64.b64encode(salt).decode())
'
)"

PW_HASH="${HASH_LINE%% *}"
PW_SALT="${HASH_LINE#* }"
if [[ -z "$PW_HASH" || -z "$PW_SALT" || "$PW_HASH" == "$PW_SALT" ]]; then
  echo "error: could not hash password inside docker-api-1." >&2
  exit 1
fi

docker exec docker-db_postgres-1 \
  psql -U postgres -d dify -v ON_ERROR_STOP=1 \
  -c "UPDATE accounts SET password = '${PW_HASH}', password_salt = '${PW_SALT}', updated_at = CURRENT_TIMESTAMP(0) WHERE email = 'lab-admin@example.com';" \
  >/dev/null

ROWS="$(docker exec docker-db_postgres-1 psql -U postgres -d dify -tAc "SELECT COUNT(*) FROM accounts WHERE email = 'lab-admin@example.com' AND password IS NOT NULL;")"
if [[ "${ROWS// /}" != "1" ]]; then
  echo "error: admin row not updated." >&2
  exit 1
fi

CREDS="$LAB_ROOT/lab-creds.env"
if [[ -f "$CREDS" ]]; then
  set_env_kv "$CREDS" DIFY_ADMIN_PASSWORD "${COLLAB_PASSWORD}"
fi

echo "updated (row count 1)."
