# Workflow Facade

`Qanna\WorkflowEngine\Facades\Workflow` is the main entry point for running workflows from your application code. It proxies to the `ExecutionManagerContract` binding (see [Contracts](contracts.md#executionmanagercontract)) — inject that contract directly if you prefer constructor injection over the facade.

```php
use Qanna\WorkflowEngine\Facades\Workflow;
```

## Running workflows

| Method | Description |
|---|---|
| `run(string $workflowId, array $payload = [], string $triggeredBy = 'manual', ExecutionMode $mode = ExecutionMode::Sync, ?string $executionId = null): ?WorkflowExecution` | Fires the trigger and, if it proceeds, executes the workflow immediately. Returns `null` if the trigger declined to run. |
| `dispatch(string $workflowId, array $payload = [], string $triggeredBy = 'manual', ?string $executionId = null): void` | Queues the workflow for background execution. |
| `resume(string $executionId): WorkflowExecution` | Resumes a previously suspended execution. Throws if no execution with this id exists. |

See [Execution](../concepts/execution.md) for the full lifecycle, `WorkflowExecution` model, and status meanings.

## Testing

`Workflow::fake(): FakeExecutionManager` swaps the real execution manager for a recording fake — every call above still runs your real workflow, just against in-memory execution storage, so you can assert on the result. See [Testing](../testing/overview.md) for the full assertion reference:

```php
Workflow::assertRan(string $workflowId): void
Workflow::assertNotRan(string $workflowId): void
Workflow::assertDispatched(string $workflowId): void
Workflow::assertResumed(string $executionId): void
Workflow::assertNothingRan(): void
Workflow::assertExecutionCount(int $count): void
Workflow::assertWorkflowRanTimes(string $workflowId, int $times): void
Workflow::assertCompleted(string $executionId): void
Workflow::assertSuspended(string $executionId): void
Workflow::assertFailed(string $executionId): void
Workflow::assertExecutionStatus(string $executionId, ExecutionStatus $status): void
Workflow::assertExecutionOutput(string $executionId, mixed $expected): void

Workflow::runs(): WorkflowExecution[]
Workflow::dispatches(): WorkflowExecution[]
Workflow::resumes(): WorkflowExecution[]
Workflow::executions(): WorkflowExecution[]
Workflow::findExecution(string $executionId): ?WorkflowExecution
```

These are only available after `Workflow::fake()` has been called.
