# Execution

Running a workflow produces a `WorkflowExecution` — a record of what happened: status, input, output, and a log entry per node. This page covers how to start, inspect, and resume executions.

## Starting an execution

All execution goes through `Qanna\WorkflowEngine\Engine\Contracts\ExecutionManagerContract`, most conveniently via the `Workflow` facade (see [Workflow Facade](../api/facade.md) for the full method list):

```php
use Qanna\WorkflowEngine\Facades\Workflow;

// Fires the trigger and, if it decides to proceed, runs the workflow immediately.
$execution = Workflow::run('send-welcome-email', ['email' => 'ada@example.com']);

// Queues the workflow for background execution instead (dispatched onto your default queue).
Workflow::dispatch('send-welcome-email', ['email' => 'ada@example.com']);
```

Both accept the same arguments: the workflow id, a payload array (available to the trigger and, from there, every node as `{{trigger.*}}` — see [Expressions](expressions.md)), an optional `$triggeredBy` label (defaults to `'manual'`; built-in triggers pass `'webhook'`, `'schedule'`, or `'model-event'`), and an optional `$executionId` if you want to control the id yourself.

`run()` returns the `WorkflowExecution` (or `null` if the trigger declined to run — see [Triggers](../triggers/overview.md)). `dispatch()` returns `void`, since the workflow hasn't run yet by the time it returns.

## The `WorkflowExecution` model

```php
final class WorkflowExecution
{
    public readonly string $id;
    public readonly string $workflowId;
    public readonly int $workflowVersion;
    public readonly ExecutionStatus $status;
    public readonly array $input;
    public readonly array $output;
    public readonly array|Collection $logs;        // ExecutionLogEntry[]
    public readonly ?string $errorMessage;
    public readonly ?Carbon $startedAt;
    public readonly ?Carbon $finishedAt;
    public readonly array $meta;
}
```

Useful methods:

```php
$execution->durationMs();  // ?int — null until finishedAt is set
$execution->isTerminal();  // true for Succeeded, Failed, or Cancelled
```

### Status

```php
enum ExecutionStatus: string
{
    case Pending = 'pending';
    case Running = 'running';
    case Succeeded = 'succeeded';
    case Suspended = 'suspended';
    case Failed = 'failed';
    case Cancelled = 'cancelled';
}
```

`Suspended` means the execution is paused, not finished — a node (e.g. [Wait](../nodes/built-in.md#action) or [Call Workflow](../nodes/built-in.md#action)) asked to pause until something happens. `Cancelled` is what a [Stop node](../nodes/built-in.md#action) produces on an intentional (non-error) stop.

## Resuming a suspended execution

```php
Workflow::resume($execution->id);
```

This is how the engine itself resumes a Wait node once its delay elapses, or a Call Workflow node once its child workflow finishes — both are wired up automatically. You'd call `resume()` yourself if you're building your own suspend point (see [Custom Nodes § Suspending and resuming](../nodes/custom-nodes.md#suspending-and-resuming)) and need to trigger the resume from outside the engine's own scheduling.

## Execution history

`Qanna\WorkflowEngine\Storage\Contracts\ExecutionRepositoryContract` (bound to whichever [storage driver](../configuration.md#storage-drivers) is configured) lets you query past executions:

```php
use Qanna\WorkflowEngine\Storage\Contracts\ExecutionRepositoryContract;

$repository = app(ExecutionRepositoryContract::class);

$repository->find($executionId);                              // ?WorkflowExecution
$repository->listForWorkflow('send-welcome-email');            // WorkflowExecution[], newest first
$repository->countForWorkflow('send-welcome-email');           // int
$repository->listByStatus(ExecutionStatus::Failed);             // WorkflowExecution[]
$repository->deleteForWorkflow('send-welcome-email');           // int deleted
$repository->purgeOlderThan(now()->subDays(90));                 // int deleted
```

## Logs

Every node that actually runs produces an `ExecutionLogEntry`:

```php
final class ExecutionLogEntry
{
    public readonly string $executionId;
    public readonly string $nodeId;
    public readonly string $type;          // the node's type string
    public readonly LogLevel $level;       // Debug | Info | Warning | Error
    public readonly string $message;
    public readonly array|Fluent $context; // includes 'status' (e.g. 'success', 'failed', 'waiting')
    public readonly ?Carbon $timestamp;
    public readonly ?int $durationMs;
}
```

`$execution->logs` holds them in order. `$entry->ran()` distinguishes a completed entry from a transient `'running'` marker.

## Next

- [Expressions](expressions.md) — referencing trigger and node data from `config`.
- [Testing](../testing/overview.md) — asserting on executions in your test suite without hitting real side effects.
