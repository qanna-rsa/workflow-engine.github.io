# Contracts

Interfaces you're expected to type-hint against, implement, or bind to when extending the engine.

## `ExecutionManagerContract`

`Qanna\WorkflowEngine\Engine\Contracts\ExecutionManagerContract` — `run()`, `dispatch()`, `resume()`. This is what the [`Workflow` facade](facade.md) proxies to; inject it directly if you'd rather not use the facade. Fully covered in [Execution](../concepts/execution.md) and [Workflow Facade](facade.md).

## `WorkflowRepositoryContract`

`Qanna\WorkflowEngine\Storage\Contracts\WorkflowRepositoryContract` — CRUD for [workflow definitions](../concepts/workflow-definitions.md): `all()`, `allActive()`, `find()`, `exists()`, `create()`, `update()`, `upsert()`, `delete()`, `findByTriggerType()`. Bound to whichever [storage driver](../configuration.md#storage-drivers) is configured. Fully covered in [Workflows § Storing and retrieving workflows](../concepts/workflows.md#storing-and-retrieving-workflows).

## `ExecutionRepositoryContract`

`Qanna\WorkflowEngine\Storage\Contracts\ExecutionRepositoryContract` — read/write access to execution history and logs: `find()`, `listForWorkflow()`, `countForWorkflow()`, `listByStatus()`, `delete()`, `deleteForWorkflow()`, `purgeOlderThan()`, plus log-specific methods. Fully covered in [Execution § Execution history](../concepts/execution.md#execution-history).

## `DynamicSchemaResolver`

`Qanna\WorkflowEngine\Engine\Contracts\DynamicSchemaResolver` — implement this to generate a `group` field's children at prompt time from previously-answered fields, as the built-in Model nodes do for their `attributes` field. One method: `resolve(array $answers): array`. Fully covered in [Dynamic Schema Resolution](../advanced/dynamic-schema.md).

## `DeclaresBranches`

`Qanna\WorkflowEngine\Engine\Contracts\DeclaresBranches` — implement on a custom node that has more than one named outcome (like the built-in Condition or Loop nodes), so authoring tools know which branches exist. One method: `static branches(): array`. Fully covered in [Custom Nodes § Branching nodes](../nodes/custom-nodes.md#branching-nodes).

## `TraversalAware`

`Qanna\WorkflowEngine\Engine\Contracts\TraversalAware` (extends `DeclaresBranches`) — implement instead of `DeclaresBranches` when your branching node behaves like a one-shot decision (Condition) rather than a repeating loop — see [Custom Nodes § Branching nodes](../nodes/custom-nodes.md#branching-nodes) for the distinction between the two.

## `StateSerializable`

`Qanna\WorkflowEngine\Engine\Contracts\StateSerializable` — `toArray()` / `static fromArray(array $data)`. Implemented by `NodeResult` and `ResumeToken` so they can be persisted and restored across a suspend/resume cycle. You won't typically need to implement this yourself unless you're persisting your own value objects the same way.
