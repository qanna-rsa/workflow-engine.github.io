# Nodes: Overview

A node is a single step in a workflow. This page covers the concepts shared by every node — how they're identified, configured, and executed. For the full list of nodes shipped with the package, see [Built-in Nodes](built-in.md). To write your own, see [Custom Nodes](custom-nodes.md).

## Identity

Every node class declares a unique type string and a human-readable label:

```php
LogNode::type();   // '@wf::action.log'
LogNode::label();  // 'Log'
```

A workflow's `nodes` array references nodes by this type string — see [Workflow Definitions](../concepts/workflow-definitions.md).

## Configuration (`schema()`)

A node declares its configuration form declaratively, using the fluent [Schema API](../advanced/field-builders.md#the-schema-api):

```php
use Qanna\WorkflowEngine\Engine\Schema\Schema;

public static function schema(): array
{
    return [
        Schema::text('message')->required()->help('Supports {{variables}}'),
        Schema::select('level')->options(['info' => 'Info', 'error' => 'Error'])->default('info'),
    ];
}
```

This is what the [interactive builder](../console/workflow-build.md) reads to prompt for a node's config, and what a workflow's `nodes[].config` is validated/shaped against. See [Custom Nodes](custom-nodes.md) for the full field reference.

## Categories

Nodes are grouped into categories for organization (used by the [interactive builder](../console/workflow-build.md)'s "Node category" picker):

`action`, `logic`, `variables`, `collections`, `text`, `datetime`, `math`, `data`, `files`, `model`. Custom nodes can use any category name — see [Custom Nodes § Registering](custom-nodes.md#registering-your-node).

## Execution

When a node runs, the engine:

1. Resolves every `{{ }}` expression in its `config` against the current execution context (see [Expressions](../concepts/expressions.md)) — your node receives already-resolved values.
2. Adds `config['_node_id']` — the node's own id in the workflow, in case your node needs it (the built-in [Log node](built-in.md#action) uses this).
3. Calls your node's `handle(WorkflowContext $context, array $config): NodeResult`.

```php
public function handle(WorkflowContext $context, array $config): NodeResult
{
    // ...
    return NodeResult::success(['result' => $value]);
}
```

## `NodeResult`

Every `handle()` returns a `NodeResult`, built via one of its named constructors:

| Constructor | Meaning |
|---|---|
| `NodeResult::success(mixed $output = [], string $branch = 'main')` | The node completed. `$output` becomes `{{nodes.<id>.*}}` for later steps. `$branch` selects which outgoing edge to follow next (see [Branching](custom-nodes.md#branching-nodes)). |
| `NodeResult::fail(string $message)` | The node failed. The execution ends with status `Failed` and this message as `errorMessage`. |
| `NodeResult::stop(mixed $output = [])` | Ends the workflow intentionally (status `Cancelled`), as the built-in [Stop node](built-in.md#action) does on its "success" outcome. |
| `NodeResult::suspend(ResumeToken $token)` | Pauses the execution until resumed — see [Custom Nodes § Suspending and resuming](custom-nodes.md#suspending-and-resuming). |

Inspect a result with `$result->ok()`, `->failed()`, `->stopped()`, `->suspended()`, `->getOutput()`, `->getErrorMessage()`, `->getBranch()`.

## Retries and timeouts

Any node can be retried on failure or capped with a timeout, by adding a reserved `__advanced__` block to its config in the workflow definition:

```php
'config' => [
    'message' => 'Hello',
    '__advanced__' => [
        'max_retries' => 3,       // default 0 (no retry)
        'retry_delay' => 2,       // seconds, default 1
        'retry_backoff' => 'exponential', // 'fixed' (default) | 'exponential'
        'timeout' => 30,          // seconds, default 0 (no timeout)
    ],
],
```

This works for every node without any code changes on the node's part. The [interactive builder](../console/workflow-build.md) doesn't currently prompt for these — set them directly in the definition if you need them.

## Next

- [Built-in Nodes](built-in.md) — the full reference.
- [Custom Nodes](custom-nodes.md) — building and registering your own.
