#!/usr/bin/env bash
# Cria bancos do projeto no Postgres (CI ou host local).
set -euo pipefail

PGHOST="${PGHOST:-localhost}"
PGPORT="${PGPORT:-5432}"
PGUSER="${PGUSER:-postgres}"
PGPASSWORD="${PGPASSWORD:-postgres}"
export PGPASSWORD

databases=(
  restaurante_auth
  restaurante_catalog
  restaurante_tables
  restaurante_orders
  restaurante_ai
  restaurante_admin
)

for db in "${databases[@]}"; do
  exists=$(psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -tAc "SELECT 1 FROM pg_database WHERE datname='${db}'" || echo "")
  if [ "$exists" != "1" ]; then
    echo "Creating database ${db}..."
    psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -c "CREATE DATABASE \"${db}\""
  else
    echo "Database ${db} already exists"
  fi
done

echo "Databases ready."
