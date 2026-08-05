# Configuration

After publishing (see [Installation](installation.md)), the config file lives at `config/workflowengine.php`. This page documents every option that affects the engine's behavior.

## Storage drivers

Workflow definitions and workflow executions are stored independently — each can use a different driver.

```php
'storage' => [
    'workflow' => [
        'driver' => env('WORKFLOW_STORAGE_DRIVER', 'file'), // 'file' | 'database'
        'path' => storage_path('workflows'),
        'connection' => null, // named connection from config/database.php, null = default
        'table' => 'workflows',
    ],

    'execution' => [
        'driver' => 'file', // 'file' | 'database' | 'memory'
        'path' => storage_path('workflow/executions'),
        'connection' => null,
        'table' => 'workflow_executions',
        'logs_table' => 'workflow_execution_logs',
    ],
],
```

| Driver | Workflows | Executions | Notes |
|---|---|---|---|
| `file` | ✅ | ✅ | JSON files under `path`. Version-controllable, zero database setup. Good default for local development. |
| `database` | ✅ | ✅ | Uses the `table` (and `logs_table`, for executions) via the given `connection`. Requires the published migrations — see [Installation](installation.md). |
| `memory` | — | ✅ | In-process only, nothing persists. Used automatically by [`Workflow::fake()`](testing/overview.md); not intended for production execution storage. |

**Recommended setups**

- **Local development** — both `file`. Workflows live in git, no database required.
- **Production** — both `database`. Queryable and purgeable at scale.
- **Mixed** — workflows on `file` (version-controlled, deployed with your code), executions on `database` (queryable history).

To register a driver of your own, see [Extension Points](advanced/extension-points.md#custom-storage-drivers).

## Sync wait timeout

```php
'sync_wait_timeout' => env('WORKFLOW_SYNC_WAIT_TIMEOUT', 30),
```

When a synchronously-run execution hits a [Wait node](nodes/built-in.md#action) with a short delay, the engine can resolve it in-process instead of round-tripping through the queue. This is the threshold (in seconds) below which that happens — waits longer than this always fall back to the queue-based resume, the same as asynchronous execution. Keep this conservative if synchronous execution is ever reachable from an HTTP request, since your web server's own request timeout will apply.

## Webhook middleware

```php
'webhook_middleware' => ['api'],
```

Middleware applied to the route registered for every workflow using a [Webhook trigger](triggers/webhook.md).

## Template delimiters

Not present in the published file by default — add it if you need to change the expression syntax used throughout [Expressions](concepts/expressions.md):

```php
'variable_open' => '{{',
'variable_close' => '}}',
```

## Environment variables

| Variable | Config key | Default |
|---|---|---|
| `WORKFLOW_STORAGE_DRIVER` | `storage.workflow.driver` | `file` |
| `WORKFLOW_SYNC_WAIT_TIMEOUT` | `sync_wait_timeout` | `30` |
