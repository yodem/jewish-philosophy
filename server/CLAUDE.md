# Strapi Server - Claude Code Guidelines

## Known Issues

### `strapi transfer` crashes with KnexTimeoutError / SQLITE_BUSY (SQLite)

**Problem:** Running `pnpm strapi transfer` (pull from remote) crashes ~15 seconds into the transfer with:

```
KnexTimeoutError: Knex: Timeout acquiring a connection. The pool is probably full.
```

or

```
SqliteError: database is locked (SQLITE_BUSY)
```

**Root cause:** The `@strapi/upload` plugin registers a `weekly-metrics` cron job via `node-schedule` that fires **15 seconds after startup** (see `node_modules/@strapi/upload/dist/server/services/weekly-metrics.js:103-106`). Since SQLite uses a single-connection pool (`min:1, max:1`), the transfer holds the only connection and the cron job can't acquire one, crashing the process.

**Why config-based fixes don't work:**
- `pool.afterCreate` with `busy_timeout` pragma: Strapi's internal DB initialization overrides pool settings for SQLite
- `server.cron.enabled = false`: Only skips adding config-defined cron tasks; `cron.start()` is called unconditionally in `@strapi/core/dist/providers/cron.js:15`
- `strapi.cron.remove('uploadWeekly')` in user bootstrap: User bootstrap runs after cron provider bootstrap, but the job has already been scheduled by `node-schedule`
- Increasing pool size for SQLite: Causes `SQLITE_BUSY` errors from concurrent writers

**Fix:** Patch `sendMetrics` in `node_modules/@strapi/upload/dist/server/services/weekly-metrics.js` to wrap the function body in try-catch so the error is logged as a warning instead of crashing the process:

```js
async sendMetrics () {
    try {
        const metrics = await this.computeMetrics();
        // ... rest of function
    } catch (err) {
        strapi1.log.warn('Weekly upload metrics skipped: ' + (err.message || err));
    }
},
```

**Important:** This patch lives in `node_modules` and will be lost on `pnpm install`. Re-apply after reinstalling dependencies. Consider using `patch-package` or `pnpm patch` to make it permanent.

## Commands

- `pnpm strapi develop` - Start dev server
- `pnpm strapi build` - Build admin panel
- `pnpm strapi transfer` - Pull/push data from/to remote Strapi instance
- `pnpm strapi deploy` - Deploy

## Database

- Local development uses **SQLite** (better-sqlite3) at `.tmp/data.db`
- Remote (Strapi Cloud) uses PostgreSQL
- SQLite uses WAL journal mode (set automatically)
- Config: `config/database.ts`

## Project Structure

- `config/` - Strapi configuration (database, server, plugins, etc.)
- `src/` - Custom Strapi code (content types, components, APIs, plugins, lifecycles)
- `src/index.ts` - App-level register/bootstrap lifecycle hooks
- `.tmp/` - SQLite database and temp files (gitignored)
