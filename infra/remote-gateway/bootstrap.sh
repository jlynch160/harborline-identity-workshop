#!/usr/bin/env bash
set -euo pipefail
umask 077
cd /opt/harborline-gateway
if test -f .initialized; then
  echo 'Gateway is already initialized; refusing to rotate credentials or recreate the database.'
  exit 0
fi
mkdir -p init
systemctl enable --now docker
docker run --rm guacamole/guacamole:1.6.0 /opt/guacamole/bin/initdb.sh --postgresql > init/001-schema.sql
python3 seed.py
chmod 0755 init
chmod 0644 init/*.sql
# Both schema and hardened account initialization run before the web service exists.
docker compose up -d database
for attempt in $(seq 1 90); do
  if test "$(docker compose exec -T database psql -U guacamole -d guacamole -tAc "SELECT count(*) FROM guacamole_entity WHERE name='presenter'" 2>/dev/null || true)" = '1'; then break; fi
  sleep 2
done
test "$(docker compose exec -T database psql -U guacamole -d guacamole -tAc "SELECT count(*) FROM guacamole_entity WHERE name='guacadmin'")" = '0'
test "$(docker compose exec -T database psql -U guacamole -d guacamole -tAc "SELECT count(*) FROM guacamole_entity WHERE name='presenter'")" = '1'
docker compose up -d
touch .initialized
echo 'Gateway started. Complete presenter MFA enrollment and validate the RDP certificate before the first desktop session.'
