# Extension Points

Beyond [custom nodes](../nodes/custom-nodes.md) and [custom triggers](../triggers/custom-triggers.md), the engine exposes two lower-level extension points: custom storage drivers, and lifecycle hooks.

## Custom storage drivers

Workflow and execution storage are resolved through `Qanna\WorkflowEngine\Storage\StorageManager`, which supports registering additional driver factories beyond the built-in `file`/`database`/`memory` ones (see [Configuration § Storage drivers](../configuration.md#storage-drivers)):

```php
use Qanna\WorkflowEngine\Storage\StorageManager;

public function boot(): void
{
    $this->app->make(StorageManager::class)->extend(
        'redis',
        function (array $config, \Illuminate\Contracts\Container\Container $app) {
            return new \App\Workflows\Storage\RedisWorkflowRepository(/* ... */);
        },
        'workflow', // or 'execution'
    );
}
```

The factory closure receives the driver's own config block (`config('workflowengine.storage.workflow')`, for example) and the container, and must return an instance implementing `WorkflowRepositoryContract` (see [Workflows § Storing and retrieving workflows](../concepts/workflows.md#storing-and-retrieving-workflows)) or `ExecutionRepositoryContract` (see [Execution § Execution history](../concepts/execution.md#execution-history)), matching the `type` you registered it under. Once registered, select it the normal way:

```php
// config/workflowengine.php
'storage' => [
    'workflow' => ['driver' => 'redis'],
],
```

## Lifecycle hooks

`Qanna\WorkflowEngine\Engine\HookDispatcher` (a container singleton) lets you react to workflow lifecycle events without modifying any node:

```php
use Qanna\WorkflowEngine\Engine\HookDispatcher;

public function boot(): void
{
    $this->app->make(HookDispatcher::class)->on(
        'workflow.finished',
        function (string $workflowId, string $executionId, $status, ?string $errorMessage, $execution) {
            // e.g. notify on failure
        },
    );
}
```

`on(string $event, callable $callback, int $priority = 100, bool $once = false)` registers a listener (lower `$priority` runs earlier); `once()` is a shorthand for a listener that removes itself after firing; `off()` removes a specific listener; `flush()` clears all listeners for an event (or every event).

### Available events

| Event | Fires with | When |
|---|---|---|
| `workflow.starting` | `$workflowId` | Right before a fresh execution begins. |
| `workflow.started` | `$workflowId, $executionId, $triggerOutput` | After the trigger has fired and the execution record exists. |
| `workflow.trigger-ignored` | `$workflowId, $payload, $reason` | The trigger returned `TriggerResult::ignore()` — no execution was created. |
| `workflow.resumed` | `$workflowId, $executionId` | A suspended execution is about to continue. |
| `workflow.node-executing` | `$workflowId, $executionId, $nodeId` | Right before a node's `handle()` is called. |
| `workflow.node-executed` | `$workflowId, $executionId, $nodeId, NodeResult $result` | Right after — inspect `$result` for success/failure/output. |
| `workflow.node-retrying` | `$workflowId, $executionId, $nodeId, array{attempt, max}` | A node is about to retry after a failure (see [Nodes: Overview § Retries and timeouts](../nodes/overview.md#retries-and-timeouts)). |
| `workflow.node-slow` | `$workflowId, $executionId, $nodeId, array{elapsed, timeout, message}` | A node exceeded its configured `timeout`. |
| `workflow.finished` | `$workflowId, $executionId, $status, $errorMessage, $execution` | The execution reached a terminal or suspended state. |

Returning `false` from a hook callback is treated as a cancellation signal for that dispatch — subsequent listeners for the same event still run, but no other part of the engine currently checks this return value, so it's only meaningful between your own listeners on the same event.

## Next

- [Custom Nodes](../nodes/custom-nodes.md) and [Custom Triggers](../triggers/custom-triggers.md) — the primary way to extend the engine.
- [Workflow Facade](../api/facade.md) and [Contracts](../api/contracts.md) — the stable public API these extension points sit alongside.
