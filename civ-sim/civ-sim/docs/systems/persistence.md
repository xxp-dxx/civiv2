# Persistence and Recovery

## Current implementation

`src/store.js` serializes the world as JSON. Saving creates the parent directory, writes a temporary file, and renames it over the target. Loading rejects state whose `version` does not equal the code's `STATE_VERSION`.

The current default path is `./data/world.json`, relative to the process working directory, overridable with `STATE_PATH`.

## Guarantees and non-guarantees

The temporary-file-and-rename pattern reduces the chance of leaving a partially written target file. It does not provide a transactional database, multi-process locking, durable backups, point-in-time recovery, corruption repair, or protection against every filesystem failure. The current application assumes a single active process.

Schema versioning detects incompatible state but does not migrate it. Do not change the state version without adding a migration or documented, tested recovery procedure.

## Future requirements

- Add automated store tests for missing files, malformed JSON, version mismatch, and failed writes.
- Define backups and restore instructions before public deployment.
- Select durable storage only after evaluating actual hosting quotas, write semantics, concurrency, and budget.
- Use transactional updates for resource transfers, construction costs, trade settlement, and other multi-record operations.
- Make scheduled event recovery and duplicate command handling explicit.
- Validate loaded state before using it, and provide clear recovery errors without exposing sensitive file contents to clients.
