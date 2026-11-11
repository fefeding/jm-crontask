# Database Migrations

Schema changes are applied through ordered SQL files in this directory, executed by
`npm run db:migrate` (see `bin/migrate.js`).

## How it works

- Files are run in **filename order** (e.g. `0001_init.sql`, `0002_xxx.sql`).
- Each applied file is recorded in the `schema_migrations` table, so it runs **only once**.
- Re-running the migration is safe: existing tables/columns are not re-created or dropped.

## Rules

- Use `CREATE TABLE IF NOT EXISTS` / `ADD COLUMN IF NOT EXISTS` — **never** `DROP TABLE`.
- Keep each migration focused and additive so production data is never wiped.
- `synchronize` in TypeORM is disabled; the schema is owned entirely by these scripts.
