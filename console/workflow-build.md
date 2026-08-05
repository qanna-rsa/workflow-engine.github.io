# The Interactive Builder

`php artisan workflow:build` walks you through constructing a workflow definition from the terminal — no need to hand-write the [nodes/edges array](../concepts/workflow-definitions.md).

```bash
php artisan workflow:build              # choose new or existing
php artisan workflow:build my-workflow  # create or edit this specific id
```

Only nodes and triggers with `cliSupported(): true` are offered — see [Built-in Nodes](../nodes/built-in.md) for which ones that is today, and [Custom Nodes § Making it available in workflow:build](../nodes/custom-nodes.md#making-it-available-in-workflowbuild) to opt your own in.

## Starting a session

- Run without an id: choose **New workflow** (you'll be asked for a name; an id is generated automatically as a slug, with a numeric suffix if it collides with an existing id) or **Edit an existing workflow** (picked from a list).
- Run with an id that doesn't exist yet: you're asked for a name and a new workflow is started under that exact id.
- Run with an id that already exists: you go straight into editing it.

## The trigger

Every session starts (or continues) by configuring the trigger — choose a [trigger type](../triggers/overview.md), then fill in its config fields. Editing an existing workflow asks first whether you want to reconfigure the trigger at all, showing you its current type.

## The main menu

Once a trigger is set, you're dropped into a loop offering:

- **Add a node** — pick where to attach it (after the trigger, or after any existing node), which branch (if the attach point has more than one — e.g. a Condition's `true`/`false`), then a category and a node type, then its config.
- **Attach to an open branch** — a shortcut that lists every branch across the whole workflow that doesn't have a node attached yet, so you don't need to remember which one you left open.
- **Reconfigure a node** — pick any existing node and re-run its config prompts, prefilled with its current values.
- **Reconfigure the trigger** — same, for the trigger.
- **Undo last add** — removes the most recently added node.
- **Finish and save** — see [Validation](#validation) below.
- **Abandon without saving** — discards everything from this session; nothing already saved is touched.

A summary of the workflow so far (name, id, and every node added) is printed before each prompt.

### Node ids

When adding or reconfiguring a node, you're asked for its id — this is the id used in [expressions](../concepts/expressions.md) (`{{nodes.<id>.*}}`) and edges. A sensible default is suggested; if the id you type collides with an existing one, a numeric suffix is appended automatically.

### Skipping configuration

The prompt to configure a freshly-added node ("Configure [Log] now?") can be declined — the node is still added, with an empty config, so you can fill it in later via **Reconfigure a node**.

## Validation

Choosing **Finish and save** runs the same graph validation the engine itself relies on (unreachable branches, illegal cycles, and so on). If problems are found, they're listed and you're asked **Save anyway?** — declining sends you back to the main menu to fix them; accepting saves regardless.

Saving increments the workflow's `version` automatically when editing an existing workflow (see [Workflow Definitions § Versioning](../concepts/workflow-definitions.md#versioning)).

## After saving

If the trigger is Webhook, Schedule, or Model, you'll see a reminder that it only takes effect after your application (and any queue workers) restart — see [Triggers § Applying trigger changes](../triggers/overview.md#applying-trigger-changes).

## Running a workflow with a designed payload

If the workflow's trigger has a [`payload` field designed](../triggers/manual.md#config) via the [schema builder](../advanced/field-builders.md#the-interactive-schema-builder-payload-fields), `php artisan workflow:run` prompts for real values matching that shape instead of requiring `--payload`:

```
$ php artisan workflow:run send-welcome-email
This workflow's trigger accepts input — fill in values for this run.
 ┌ Customer ─────────────────────────────────────────────────┐
 │ Ada                                                        │
 └──────────────────────────────────────────────────────────-┘
```

## Next

- [Field Builders](../advanced/field-builders.md) — the JSON builder and per-field-type configuration used while filling in a node's config.
- [Dynamic Schema Resolution](../advanced/dynamic-schema.md) — how a Model node's `attributes` field populates itself from your chosen model.
