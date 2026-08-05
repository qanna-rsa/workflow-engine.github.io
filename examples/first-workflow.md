# Example: Your First Workflow

A slightly richer walkthrough than the [Quick Start](../quickstart.md): a workflow that branches on the trigger payload.

**Goal:** given an `age` in the trigger payload, log whether the person is an adult or a minor.

## The definition

```php
use Qanna\WorkflowEngine\Engine\Nodes\Action\LogNode;
use Qanna\WorkflowEngine\Engine\Nodes\Logic\ConditionNode;
use Qanna\WorkflowEngine\Engine\Triggers\ManualTrigger;
use Qanna\WorkflowEngine\Models\Workflow;
use Qanna\WorkflowEngine\Storage\Contracts\WorkflowRepositoryContract;

$workflow = Workflow::fromArray([
    'id' => 'age-check',
    'name' => 'Age Check',
    'trigger' => [
        'type' => ManualTrigger::type(),
        'config' => [],
    ],
    'nodes' => [
        [
            'id' => 'check',
            'type' => ConditionNode::type(),
            'config' => ['field' => '{{trigger.age}}', 'operator' => '>=', 'value' => '18'],
        ],
        [
            'id' => 'adult',
            'type' => LogNode::type(),
            'config' => ['level' => 'info', 'message' => 'Adult: {{trigger.age}}'],
        ],
        [
            'id' => 'minor',
            'type' => LogNode::type(),
            'config' => ['level' => 'info', 'message' => 'Minor: {{trigger.age}}'],
        ],
    ],
    'edges' => [
        ['from' => 'trigger', 'to' => 'check', 'branch' => 'main'],
        ['from' => 'check', 'to' => 'adult', 'branch' => 'true'],
        ['from' => 'check', 'to' => 'minor', 'branch' => 'false'],
    ],
]);

app(WorkflowRepositoryContract::class)->create($workflow);
```

Note how `check`'s two outcomes (`true`/`false` — see [Condition](../nodes/built-in.md#logic)) each get their own edge, both `from => 'check'`, distinguished only by `branch`. Only one of `adult`/`minor` runs per execution.

## Or, build it interactively

```bash
php artisan workflow:build age-check
```

- Trigger: **Manual**.
- Add a node after the trigger: category **Logic**, type **Condition** — `field` = `{{trigger.age}}`, `operator` = **Greater than or equal**, `value` = `18`.
- Attach to an open branch: `check → true` — category **Action**, type **Log** — message `Adult: {{trigger.age}}`.
- Attach to an open branch: `check → false` — category **Action**, type **Log** — message `Minor: {{trigger.age}}`.
- Finish and save.

See [The Interactive Builder](../console/workflow-build.md) for the full command reference.

## Run it

```php
use Qanna\WorkflowEngine\Facades\Workflow;

$execution = Workflow::run('age-check', ['age' => 21]);

$execution->status;                          // ExecutionStatus::Succeeded
$execution->logs->pluck('nodeId')->all();     // ['check', 'adult']
```

```bash
php artisan workflow:run age-check --payload='{"age": 16}'
```

```
  ✓ check [Condition] (0ms) — ...
  ✓ minor [Log] (1ms) — Minor: 16

Workflow [age-check] succeeded in 3ms — 2 node(s) executed.
```

## Next

- [Creating a Custom Node](custom-node.md)
- [Testing a Workflow](testing-workflows.md)
