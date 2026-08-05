# Schedule Trigger

**Type:** `@wf::trigger.schedule`

Runs a workflow on a cron schedule, via Laravel's own task scheduler.

## Config

| Field | Type | Notes |
|---|---|---|
| `cron` | text, required | A standard cron expression, e.g. `*/5 * * * *`. |
| `timezone` | text | Defaults to your application's timezone (`config('app.timezone')`). |

## Requirements

This trigger registers itself with Laravel's `Schedule` when your application boots — you still need your server's own cron entry running Laravel's scheduler every minute, exactly as for any other Laravel scheduled task:

```bash
* * * * * php /path/to/artisan schedule:run >> /dev/null 2>&1
```

## Payload

Each run's `{{trigger.*}}` payload is:

```json
{ "scheduled_at": "2026-01-01T00:05:00+00:00", "cron": "*/5 * * * *" }
```

## Applying changes

The cron entry is only registered when your application boots. After creating a workflow with a Schedule trigger, or changing its `cron`/`timezone`, restart your application and any scheduler-running process for the change to take effect — see [Triggers § Applying trigger changes](overview.md#applying-trigger-changes).
