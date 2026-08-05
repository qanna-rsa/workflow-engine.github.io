# Custom Nodes

A node is a plain class extending `Qanna\WorkflowEngine\Node`. This page covers everything needed to write, register, and use one.

## A minimal node

```php
namespace App\Workflows\Nodes;

use Qanna\WorkflowEngine\Engine\Context\WorkflowContext;
use Qanna\WorkflowEngine\Engine\Schema\Schema;
use Qanna\WorkflowEngine\Node;
use Qanna\WorkflowEngine\NodeResult;

class SendSlackMessageNode extends Node
{
    public static function type(): string
    {
        return 'app::slack.send-message';
    }

    public static function label(): string
    {
        return 'Send Slack message';
    }

    public static function schema(): array
    {
        return [
            Schema::text('channel')->required()->placeholder('#general'),
            Schema::text('message')->required()->help('Supports {{variables}}'),
        ];
    }

    public function handle(WorkflowContext $context, array $config): NodeResult
    {
        // ... send the message ...

        return NodeResult::success(['sent' => true]);
    }
}
```

`type()` just needs to be globally unique — it isn't required to follow the `@wf::` convention used by built-in nodes (see [Workflow Definitions § Node type strings](../concepts/workflow-definitions.md#node-type-strings)).

`schema()` describes the config form using the fluent [Schema API](../advanced/field-builders.md#the-schema-api) — see [Nodes: Overview](overview.md#configuration-schema) and [Built-in Nodes](built-in.md) for real examples of every field type in use.

## Registering your node

Register it against the `NodeRegistry` singleton, typically from your own service provider's `boot()`:

```php
use Qanna\WorkflowEngine\Engine\NodeRegistry;

public function boot(): void
{
    $this->app->make(NodeRegistry::class)->register(
        \App\Workflows\Nodes\SendSlackMessageNode::class,
        'action', // category — see Nodes: Overview § Categories
    );
}
```

`register()` also accepts an array of class names to register several at once.

## Making it available in `workflow:build`

By default, a custom node only appears in workflow definitions you write by hand or generate programmatically — the [interactive builder](../console/workflow-build.md) only offers nodes that opt in:

```php
public static function cliSupported(): bool
{
    return true;
}
```

## Node state

A node instance can persist small pieces of state across suspend/resume cycles for the *same execution* — this is how the built-in [Wait node](built-in.md#action) remembers the timestamp it's waiting for:

```php
public function handle(WorkflowContext $context, array $config): NodeResult
{
    if ($this->hasState('started_at')) {
        // this is a resume — pick up where we left off
    }

    $this->remember('started_at', now()->toIso8601String());
    $this->state('started_at');   // read it back, with an optional default
    $this->forgetState('started_at');

    // ...
}
```

## Branching nodes

Most nodes have a single outcome (`NodeResult::success()` defaults its `$branch` to `'main'`). A node that needs multiple named outcomes — like the built-in [Condition](built-in.md#logic) or [Loop](built-in.md#logic) — declares them by implementing `Qanna\WorkflowEngine\Engine\Contracts\DeclaresBranches`:

```php
use Qanna\WorkflowEngine\Engine\Contracts\DeclaresBranches;

class ApprovalGateNode extends Node implements DeclaresBranches
{
    public static function branches(): array
    {
        return ['approved', 'rejected'];
    }

    public function handle(WorkflowContext $context, array $config): NodeResult
    {
        return NodeResult::success(branch: $wasApproved ? 'approved' : 'rejected');
    }
}
```

This tells authoring tools (the interactive builder, or your own UI) which branches exist so they can offer them as attachment points in a [workflow definition](../concepts/workflow-definitions.md#edges).

There are two shapes of branching node:

- **Decision nodes** (like Condition) run *one* branch once and are done — once that branch's nodes finish, execution continues right after the decision node, with no edge back to it needed. Implement `Qanna\WorkflowEngine\Engine\Contracts\TraversalAware` (which extends `DeclaresBranches`) for this behavior.
- **Repeating nodes** (like Loop) re-enter their own non-`main` branch on each iteration and need an explicit edge from the end of that branch back to the node itself in the workflow definition. Implement `DeclaresBranches` only (not `TraversalAware`).

## Suspending and resuming

A node can pause an execution and resume it later — the built-in [Wait](built-in.md#action) and [Call workflow](built-in.md#action) nodes both do this. Return a suspended result with a `ResumeToken`:

```php
use Qanna\WorkflowEngine\Engine\Resume\ResumeToken;

return NodeResult::suspend(ResumeToken::manual('awaiting manager approval'));
```

`ResumeToken` has named constructors for each way an execution can wait:

| Constructor | Resumes when |
|---|---|
| `ResumeToken::wait(CarbonInterface $until)` | The given date/time is reached — resumed automatically. |
| `ResumeToken::workflow(string $workflowId, array $payload = [])` | A child workflow started with `$payload` finishes — resumed automatically. |
| `ResumeToken::webhook()` | A matching webhook request arrives. |
| `ResumeToken::event(string $event, array $payload = [])` | A named application event fires. |
| `ResumeToken::manual(?string $reason = null)` | Only when your application code calls `resume()` directly. |

For anything other than `wait()`/`workflow()` (which the engine resumes on its own), your application resumes the execution itself once the condition is met:

```php
use Qanna\WorkflowEngine\Facades\Workflow;

Workflow::resume($executionId);
```

When resumed, your node's `handle()` runs again — check `$this->hasState(...)` to tell a resume apart from the first run, as shown above.

## Next

- [Dynamic Schema Resolution](../advanced/dynamic-schema.md) — config fields whose options depend on another field's value, like the built-in Model nodes.
- [Triggers § Custom Triggers](../triggers/custom-triggers.md) — the same pattern, for starting a workflow instead of stepping through it.
