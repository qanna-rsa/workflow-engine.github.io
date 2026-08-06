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

- **Add a node** — pick where to attach it (after the trigger, or after any existing node), which branch (if the attach point has more than one — e.g. a Condition's `true`/`false`), then a category and a node type, then its config. If that branch already leads somewhere, you're asked whether to insert the new node *before* the existing one, splicing it into the chain, instead of failing outright.
- **Attach to an open branch** — a shortcut that lists every branch across the whole workflow that doesn't have a node attached yet, so you don't need to remember which one you left open.
- **Reconfigure a node** — pick any existing node and re-run its config prompts, prefilled with its current values.
- **Remove a node** — pick any existing node and delete it. If it sat inline (one thing in, one thing out), its predecessor and successor are reconnected automatically so the chain stays intact. If it was a branch-capable node with children on more than one branch, those children are left in place but disconnected — you're told which ones, so you can reconnect or remove them next.
- **Reconnect a disconnected node** — only offered once a removal has left something dangling; pick the orphaned node and a new attach point for it, same as adding a node.
- **Reconfigure the trigger** — same as reconfiguring a node, for the trigger.
- **Undo last add** — removes the most recently added node.
- **Finish and save** — see [Validation](#validation) below.
- **Abandon without saving** — discards everything from this session; nothing already saved is touched.

A summary of the workflow so far is printed before each prompt, nested to match the graph — a node attached to a branch (e.g. a Condition's `true` arm) is indented under it, tagged with the branch it's on, rather than listed flat alongside everything else. Any disconnected nodes are listed separately underneath.

### Merging branches back into the flow

A branch-capable node like [Condition](../nodes/built-in.md#logic) always has a `main` branch available to attach to, alongside its named ones (`true`/`false`, a Switch's cases, a Scope's `body`) — even though it's never listed as one of the node's own declared branches. Attach whatever should happen after *either* branch to it instead of repeating those steps at the end of both:

```
check (Condition)
└─ adult-log [true] (Log)
└─ minor-log [false] (Log)
└─ continue-log (Log)      <- attached to check's own 'main' branch
```

Once whichever of `true`/`false` runs out of nodes, execution resumes from `check`'s `main` edge automatically — you don't need to attach anything to the *end* of the `true`/`false` chains themselves for this to happen, and a dead end at the end of either is expected, not an error. This is different from [For each](../nodes/built-in.md#logic)'s `main`: a loop closes by cycling its body's dead end back to the loop node itself (handled for you automatically when you save), whereas Condition/Switch/Scope never cycle — their `main` is a normal forward edge to whatever comes next.

### Node ids

When adding or reconfiguring a node, you're asked for its id — this is the id used in [expressions](../concepts/expressions.md) (`{{nodes.<id>.*}}`) and edges. A sensible default is suggested; if the id you type collides with an existing one, a numeric suffix is appended automatically.

### Skipping configuration

The prompt to configure a freshly-added node ("Configure [Log] now?") can be declined — the node is still added, with an empty config, so you can fill it in later via **Reconfigure a node**.

## Validation

Choosing **Finish and save** runs the same graph validation the engine itself relies on (edges targeting an undeclared branch, illegal cycles, and so on). If problems are found, they're listed and you're asked **Save anyway?** — declining sends you back to the main menu to fix them; accepting saves regardless. A disconnected node left over from a removal isn't flagged here — it's simply not reachable when the workflow runs, the same as any dead-end node.

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
