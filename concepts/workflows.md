# Workflows

A **workflow** is a stored, versioned definition: a trigger plus a graph of nodes. This page covers the `Workflow` model and how to store and retrieve workflows through the repository contract. For the shape of the definition itself (trigger/nodes/edges), see [Workflow Definitions](workflow-definitions.md).

## The `Workflow` model

`Qanna\WorkflowEngine\Models\Workflow` is an immutable value object:

```php
final class Workflow
{
    public readonly string $id;
    public readonly string $name;
    public readonly int $version;
    public readonly array $trigger;   // ['type' => ..., 'config' => ...]
    public readonly array $nodes;     // list of node arrays
    public readonly array $edges;     // list of edge arrays
    public readonly array $meta;
    public readonly bool $active;
    public readonly ?Carbon $createdAt;
    public readonly ?Carbon $updatedAt;
}
```

Build one from an array (e.g. decoded JSON) with `Workflow::fromArray()`, and get it back with `toArray()` / `toJson()` (it implements `Arrayable`, `Jsonable`, and `JsonSerializable`).

Since the model is immutable, `withVersion(int $version)` and `withNodes(array $nodes)` return a new instance with that field replaced rather than mutating in place:

```php
$updated = $workflow->withNodes($newNodes)->withVersion($workflow->version + 1);
```

Two small lookup helpers are also available:

```php
$workflow->nodeById('log');      // ?array — the node with this id, or null
$workflow->edgesFrom('log');     // array — every edge whose 'from' is this node
```

## Storing and retrieving workflows

All persistence goes through `Qanna\WorkflowEngine\Storage\Contracts\WorkflowRepositoryContract`, resolved from the container (bound to whichever [storage driver](../configuration.md#storage-drivers) is configured):

```php
use Qanna\WorkflowEngine\Storage\Contracts\WorkflowRepositoryContract;

$repository = app(WorkflowRepositoryContract::class);
```

| Method | Description |
|---|---|
| `all(): Workflow[]` | Every stored workflow. |
| `allActive(): Workflow[]` | Only workflows where `active` is `true`. |
| `find(string $id): ?Workflow` | A single workflow, or `null` if it doesn't exist. |
| `exists(string $id): bool` | Whether a workflow with this id exists. |
| `create(Workflow $workflow): Workflow` | Persist a new workflow. Throws `WorkflowAlreadyExistsException` if the id is taken. |
| `update(Workflow $workflow): Workflow` | Overwrite an existing workflow entirely. Throws `WorkflowNotFoundException` if it doesn't exist. |
| `upsert(Workflow $workflow): Workflow` | Create or overwrite, regardless of whether it exists. |
| `delete(string $id): bool` | Delete by id. Returns `false` if it didn't exist. |
| `findByTriggerType(string $triggerType): Workflow[]` | Every workflow using a given trigger type — used internally by triggers to register themselves (webhook routes, cron entries, model listeners) on boot. |

`update()` overwrites the record as-is, including `version` — it does not bump the version for you. If you want each save to be a new version, increment it yourself:

```php
$repository->update($workflow->withVersion($workflow->version + 1));
```

(The interactive builder handles this automatically — see [The Interactive Builder](../console/workflow-build.md).)

## Active vs. inactive

The `active` flag doesn't stop a workflow from being run directly — `Workflow::run()` and `Workflow::dispatch()` (see [Execution](execution.md)) work regardless of it. It's a convention consumers can use to select which workflows should be considered "live" — for example, `allActive()` is what you'd use to build an admin listing of enabled automations, and triggers can be built to respect it when they choose which workflows to wire up.

## Next

- [Workflow Definitions](workflow-definitions.md) for the trigger/nodes/edges shape.
- [Execution](execution.md) for running a workflow and inspecting the result.
