# Console Commands

The package ships two Artisan commands.

| Command | Description |
|---|---|
| `workflow:build {id?}` | Interactively create or edit a workflow definition. See [The Interactive Builder](workflow-build.md). |
| `workflow:run {id} {--payload=}` | Run a saved workflow from the terminal. |

## `workflow:run`

```bash
php artisan workflow:run send-welcome-email
php artisan workflow:run send-welcome-email --payload='{"email":"ada@example.com"}'
```

- `id` — the workflow's id. If it doesn't exist, the command lists the ids that do.
- `--payload` — JSON-encoded object merged into (and overriding) the trigger's saved config before the run starts.

If the workflow's trigger has a config field left to fill in interactively (see [Manual Trigger § Config](../triggers/manual.md#config)), and you're running in an interactive terminal, you're prompted for values before the run starts — `--payload` values take precedence over anything you'd otherwise be prompted for.

The command prints a line per executed node as the workflow runs, then a final success/failure summary, and exits `0` on success or `1` on failure (including when the workflow itself doesn't exist, or the trigger declines to run).

```
  ✓ log [Log] (2ms) — Processing signup for ada@example.com

Workflow [send-welcome-email] succeeded in 4ms — 1 node(s) executed.
```

## Next

- [The Interactive Builder](workflow-build.md) — the full `workflow:build` reference.
