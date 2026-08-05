# Quick Start

This walks through creating and running a small workflow: a manually-triggered workflow that logs a message. It assumes you've completed [Installation](installation.md).

## Option A — build it interactively

```bash
php artisan workflow:build
```

The command will ask you to:

1. Choose **New workflow** and give it a name (e.g. "Send Welcome Email"). An id is generated automatically from the name.
2. Choose a trigger — pick **Manual**.
3. From the main menu, choose **Add a node**, attach it after the trigger, pick the **Action** category, then **Log**.
4. Fill in the log level and message (try `Processing signup for {{trigger.email}}` to see [expressions](concepts/expressions.md) in action).
5. Choose **Finish and save**.

See [The Interactive Builder](console/workflow-build.md) for the full command reference.

## Option B — define it in code

Workflows are plain data, so you can build the same definition with `Workflow::fromArray()` and persist it through the repository contract:

```php
use Qanna\WorkflowEngine\Engine\Nodes\Action\LogNode;
use Qanna\WorkflowEngine\Engine\Triggers\ManualTrigger;
use Qanna\WorkflowEngine\Models\Workflow;
use Qanna\WorkflowEngine\Storage\Contracts\WorkflowRepositoryContract;

$workflow = Workflow::fromArray([
    'id' => 'send-welcome-email',
    'name' => 'Send Welcome Email',
    'trigger' => [
        'type' => ManualTrigger::type(),
        'config' => [],
    ],
    'nodes' => [
        [
            'id' => 'log',
            'type' => LogNode::type(),
            'config' => [
                'level' => 'info',
                'message' => 'Processing signup for {{trigger.email}}',
            ],
        ],
    ],
    'edges' => [
        ['from' => 'trigger', 'to' => 'log', 'branch' => 'main'],
    ],
]);

app(WorkflowRepositoryContract::class)->create($workflow);
```

See [Workflow Definitions](concepts/workflow-definitions.md) for the full shape of a definition.

## Run it

From the terminal:

```bash
php artisan workflow:run send-welcome-email --payload='{"email":"ada@example.com"}'
```

Or from your application code, via the `Workflow` facade:

```php
use Qanna\WorkflowEngine\Facades\Workflow;

$execution = Workflow::run('send-welcome-email', ['email' => 'ada@example.com']);

$execution->status;   // ExecutionStatus::Succeeded
$execution->output;   // the final node's output
```

## Next steps

- [Workflows](concepts/workflows.md) — the storage and execution lifecycle.
- [Built-in Nodes](nodes/built-in.md) — everything you can add to a workflow out of the box.
- [Triggers](triggers/overview.md) — Webhook, Schedule, and Model event triggers.
- [Testing](testing/overview.md) — asserting your app triggers workflows correctly.
