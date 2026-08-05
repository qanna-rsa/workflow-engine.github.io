# Manual Trigger

**Type:** `@wf::trigger.manual`

The simplest trigger — it never fires on its own. A workflow using it only runs when you call it explicitly, via the [`Workflow` facade](../api/facade.md) or the [`workflow:run`](../console/workflow-build.md) command:

```php
use Qanna\WorkflowEngine\Facades\Workflow;

Workflow::run('send-welcome-email', ['email' => 'ada@example.com']);
```

```bash
php artisan workflow:run send-welcome-email --payload='{"email":"ada@example.com"}'
```

Whatever payload you pass becomes `{{trigger.*}}` for the rest of the workflow.

## Config

### `payload`

A **builder** field — instead of a single value, you interactively design the *shape* the trigger's payload is expected to have (field names, types, and whether each is required), the same way you'd design a form. See [Field Builders § The Schema Builder](../advanced/field-builders.md#the-interactive-schema-builder-payload-fields) for how this works in `workflow:build`.

Once a payload shape has been designed and saved, `php artisan workflow:run` uses it to prompt you for real values interactively (instead of requiring `--payload`) — see [Workflow Build § Running with a designed payload](../console/workflow-build.md#running-a-workflow-with-a-designed-payload).

This is also useful as living documentation of what a Manual-triggered workflow expects, even if you always pass `--payload` directly and never use the interactive prompts.

## Also used by other nodes

[Call workflow](../nodes/built-in.md#action) only lists workflows that use a Manual trigger as valid targets — a child workflow is expected to be invocable directly, the same way a Manual-triggered workflow is.
