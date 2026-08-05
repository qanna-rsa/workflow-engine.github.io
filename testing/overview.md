# Testing

`Workflow::fake()` lets you assert that your application triggers the right workflows, without needing to inspect internals or stub anything by hand.

```php
use Qanna\WorkflowEngine\Facades\Workflow;

Workflow::fake();

// ... code under test that calls Workflow::run() / dispatch() / resume() ...

Workflow::assertRan('send-welcome-email');
```

## What faking does (and doesn't) change

`Workflow::fake()` only fakes **execution storage** — swapping it for an in-memory driver so tests don't touch disk or your real database, and so state doesn't leak between tests. It does **not** stub out the engine: `run()`/`dispatch()`/`resume()` still execute your real workflow, through the real node handlers, exactly as in production. This means assertions like `assertExecutionOutput()` reflect what the workflow actually produced, not a canned response.

Workflow *definitions* aren't faked — persist a real one first (e.g. via the [repository contract](../concepts/workflows.md#storing-and-retrieving-workflows) or a small factory in your test suite), then fake execution storage before running it:

```php
use Qanna\WorkflowEngine\Storage\Contracts\WorkflowRepositoryContract;

app(WorkflowRepositoryContract::class)->create($workflow);

Workflow::fake();

$execution = Workflow::run($workflow->id, ['email' => 'ada@example.com']);
```

`dispatch()` behaves differently under `fake()` too: instead of queuing a job, it runs the workflow immediately (so there's an execution to assert on right away), while `run()`/`dispatch()`/`resume()` calls are still recorded separately so you can tell which one your code actually used.

Anything a workflow suspends on (a [Wait](../nodes/built-in.md#action) node's delay, a [Call workflow](../nodes/built-in.md#action) node's child run) resolves inline and instantly under `fake()`, rather than sleeping or touching a real queue — so a workflow that waits or calls another workflow still runs to completion synchronously in your test.

## Assertions

| Assertion | Checks |
|---|---|
| `assertRan(string $workflowId)` | `run()` was called for this workflow. |
| `assertNotRan(string $workflowId)` | It wasn't. |
| `assertDispatched(string $workflowId)` | `dispatch()` was called for this workflow. |
| `assertResumed(string $executionId)` | `resume()` was called for this execution. |
| `assertNothingRan()` | No workflow ran at all. |
| `assertExecutionCount(int $count)` | Total distinct executions recorded across `run()`/`dispatch()`/`resume()`. |
| `assertWorkflowRanTimes(string $workflowId, int $times)` | This workflow ran exactly `$times` times. |
| `assertCompleted(string $executionId)` | The execution's status is `Succeeded`. |
| `assertSuspended(string $executionId)` | The execution's status is `Suspended`. |
| `assertFailed(string $executionId)` | The execution's status is `Failed`. |
| `assertExecutionStatus(string $executionId, ExecutionStatus $status)` | Any specific status. |
| `assertExecutionOutput(string $executionId, mixed $expected)` | The execution's final `output` matches exactly. |

## Inspecting recorded executions directly

When an assertion helper doesn't cover what you need, drop down to the recorded `WorkflowExecution` objects directly (see [Execution](../concepts/execution.md) for the model's shape):

```php
Workflow::runs();          // WorkflowExecution[] — every run() call
Workflow::dispatches();    // WorkflowExecution[] — every dispatch() call
Workflow::resumes();       // WorkflowExecution[] — every resume() call
Workflow::executions();    // WorkflowExecution[] — every distinct execution, deduplicated by id
Workflow::findExecution($executionId); // ?WorkflowExecution
```

## Testing custom nodes directly

A node's `handle()` has no framework dependency beyond `WorkflowContext` and `array $config` — you can unit test it without going through a workflow at all:

```php
use Qanna\WorkflowEngine\Engine\Context\WorkflowContext;

$result = (new SendSlackMessageNode())->handle(
    WorkflowContext::make(['trigger' => ['channel' => '#general']]),
    ['channel' => '#general', 'message' => 'Hello'],
);

$this->assertTrue($result->ok());
```

## Next

- [Testing a Workflow](../examples/testing-workflows.md) — a full worked example.
