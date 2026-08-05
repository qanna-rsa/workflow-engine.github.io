# Triggers: Overview

A trigger decides when a workflow runs and what its initial payload is. Every workflow has exactly one.

## Built-in triggers

| Trigger | Type | Fires when |
|---|---|---|
| [Manual](manual.md) | `@wf::trigger.manual` | You call it directly — `Workflow::run()`/`dispatch()`, or `php artisan workflow:run`. |
| [Webhook](webhook.md) | `@wf::trigger.webhook` | An HTTP request hits the workflow's generated URL. |
| [Schedule](schedule.md) | `@wf::trigger.schedule` | A cron expression matches, via Laravel's scheduler. |
| [Model](model.md) | `@wf::trigger.model` | An Eloquent model fires a lifecycle event (created, updated, etc.). |

All four are `cliSupported`, so all four are available in [`workflow:build`](../console/workflow-build.md).

## How a trigger fires

Every path that starts an execution — the [`Workflow` facade's](../api/facade.md) `run()`/`dispatch()`, or a trigger firing on its own (a webhook request, a schedule tick, a model event) — ultimately calls the trigger's `handle()`, which returns a `TriggerResult`:

```php
TriggerResult::continue(mixed $output = null); // proceed — $output becomes {{trigger.*}}
TriggerResult::ignore(?string $reason = null);  // don't run the workflow this time
```

Every built-in trigger always continues with whatever payload it was given — `ignore()` exists for triggers (including your own) that need to apply a condition before deciding to run.

## Trigger config, like node config

A trigger declares its own configuration the same way a node does — a `schema()` using the [Schema API](../advanced/field-builders.md#the-schema-api) — and is configured the same way in a [workflow definition](../concepts/workflow-definitions.md#trigger):

```php
'trigger' => ['type' => '@wf::trigger.schedule', 'config' => ['cron' => '*/5 * * * *']]
```

## Applying trigger changes

Webhook, Schedule, and Model triggers wire themselves up (registering a route, a cron entry, or a model event listener) once, when your application boots — not the moment you save the workflow. After creating or editing a workflow that uses one of these, **restart your application and any queue workers** for the change to take effect. `workflow:build` prints a reminder when this applies. Manual triggers need no such restart.

## Next

- [Manual](manual.md), [Webhook](webhook.md), [Schedule](schedule.md), [Model](model.md) — the built-in triggers in detail.
- [Custom Triggers](custom-triggers.md) — writing your own.
