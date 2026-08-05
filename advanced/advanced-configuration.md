# Advanced Configuration

This page covers configuration concerns beyond the basic options in [Configuration](../configuration.md) — running the engine reliably in production.

## Queues

`Workflow::dispatch()`, background resumes (a suspended [Wait](../nodes/built-in.md#action) node whose delay exceeds [`sync_wait_timeout`](../configuration.md#sync-wait-timeout), or any other queue-based resume) are handled by standard Laravel jobs on your **default queue connection** — no dedicated connection or queue name is required. Make sure a queue worker is running if your application uses any of:

- `Workflow::dispatch()` (as opposed to `run()`).
- A Wait node with a delay longer than `sync_wait_timeout`.
- A Schedule or Model trigger — both call `run()` synchronously by default, so this only matters if your own code wraps them in `dispatch()`.

```bash
php artisan queue:work
```

## Sizing `sync_wait_timeout`

[`sync_wait_timeout`](../configuration.md#sync-wait-timeout) controls the cutoff (in seconds) below which a synchronous `run()` call resolves a [Wait node](../nodes/built-in.md#action) in-process instead of handing it to the queue. If `run()` is ever reachable from an HTTP request in your application, keep this well under your web server's request timeout — a wait that resolves in-process holds the request open for its full duration.

## Choosing storage drivers per environment

See [Configuration § Storage drivers](../configuration.md#storage-drivers) for the full option reference. A common setup:

```php
// config/workflowengine.php
'storage' => [
    'workflow' => [
        'driver' => env('WORKFLOW_STORAGE_DRIVER', 'file'), // git-versioned in every environment
    ],
    'execution' => [
        'driver' => env('WORKFLOW_EXECUTION_STORAGE_DRIVER', app()->environment('production') ? 'database' : 'file'),
    ],
],
```

## Pruning execution history

Nothing purges execution records automatically — schedule it yourself using [`ExecutionRepositoryContract::purgeOlderThan()`](../concepts/execution.md#execution-history):

```php
// app/Console/Kernel.php
use Qanna\WorkflowEngine\Storage\Contracts\ExecutionRepositoryContract;

$schedule->call(function () {
    app(ExecutionRepositoryContract::class)->purgeOlderThan(now()->subDays(90));
})->daily();
```

## Next

- [Extension Points](extension-points.md) — custom storage drivers and lifecycle hooks.
