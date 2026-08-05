# Workflow Definitions

A workflow definition is plain, storable data — a trigger, a list of nodes, and a list of edges connecting them. This is the shape you pass to `Workflow::fromArray()`, and the shape returned by `Workflow::toArray()` / `toJson()`.

```php
[
    'id' => 'send-welcome-email',
    'name' => 'Send Welcome Email',
    'version' => 1,
    'trigger' => [
        'type' => '@wf::trigger.manual',
        'config' => [],
    ],
    'nodes' => [
        [
            'id' => 'log',
            'type' => '@wf::action.log',
            'config' => ['level' => 'info', 'message' => 'Hello {{trigger.email}}'],
        ],
    ],
    'edges' => [
        ['from' => 'trigger', 'to' => 'log', 'branch' => 'main'],
    ],
    'meta' => [],
    'active' => true,
]
```

## Trigger

```php
'trigger' => ['type' => string, 'config' => array]
```

`type` is a registered trigger's type string (see [Triggers](../triggers/overview.md)); `config` is whatever that trigger's `schema()` declares. There is exactly one trigger per workflow, and it's always addressed as the synthetic node id `'trigger'` in edges — it's never listed in `nodes`.

## Nodes

Each entry in `nodes` is:

```php
['id' => string, 'type' => string, 'config' => array]
```

- `id` is unique within the workflow — you choose it (e.g. `'log'`, `'check-age'`). It's how edges and [expressions](expressions.md) (`{{nodes.check-age.result}}`) refer back to this step.
- `type` is a registered node's type string — see [Built-in Nodes](../nodes/built-in.md) for the full list, or [Custom Nodes](../nodes/custom-nodes.md) to register your own.
- `config` is whatever that node's `schema()` declares (each node's reference page documents its fields).

### Node type strings

A node's `type()` is just a unique string — the registry uses it as an opaque lookup key, so any punctuation is fine as long as it's unique. Built-in nodes are namespaced under `@wf::`, followed by a group and an action separated by a `.`, e.g. `@wf::action.log`, `@wf::model.create`. Your own custom nodes can use any type string you like (see [Custom Nodes](../nodes/custom-nodes.md)) — the examples throughout this documentation use an `app::` namespace by convention, to keep them visually distinct from built-ins.

## Edges

Each entry in `edges` is:

```php
['from' => string, 'to' => string, 'branch' => string]
```

- `from` / `to` are node ids (or `'trigger'` for the first edge).
- `branch` selects which of the source node's outcomes this edge follows. Most nodes only ever produce one outcome, so `branch` is `'main'`. Nodes that can branch use other names — e.g. a [Condition](../nodes/built-in.md#logic) node produces `'true'` or `'false'`, and a [Switch](../nodes/built-in.md#logic) node produces whichever case branch matched (or `'default'`).

Always include `branch` explicitly — it's matched exactly, so an edge without it won't be found when the engine looks up `'main'`.

A plain node has at most one outgoing edge. Only branch-producing nodes (Condition, Switch, Loop, Scope) can have more than one outgoing edge, one per branch.

## Versioning

`version` is a plain integer you control. The [repository contract](workflows.md#storing-and-retrieving-workflows) doesn't bump it automatically on `update()` — increment it yourself if each save should represent a new version. The [interactive builder](../console/workflow-build.md) does this for you.

## `meta` and `active`

`meta` is a free-form array for your own application's use (the engine doesn't read it). `active` is a convention flag — see [Workflows § Active vs. inactive](workflows.md#active-vs-inactive).

## Next

- [Execution](execution.md) — running a definition and inspecting the result.
- [Expressions](expressions.md) — the `{{ }}` syntax referenced in `config` values above.
