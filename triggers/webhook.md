# Webhook Trigger

**Type:** `@wf::trigger.webhook`

Runs a workflow when a `POST` request hits a generated, unguessable URL.

## Config

| Field | Type | Notes |
|---|---|---|
| `path` | text (disabled) | Auto-generated 40-character random path. Not user-editable. |
| `secret` | text (sensitive) | Optional. When set, requests must send it back in the `X-Webhook-Secret` header, or the request is rejected with `401`. |

## The URL

The route is registered at `POST /webhooks/{path}`, e.g.:

```
POST https://your-app.test/webhooks/aB3xQ...
```

Get the full URL for a saved workflow with the trigger's static helper:

```php
use Qanna\WorkflowEngine\Engine\Triggers\WebhookTrigger;

WebhookTrigger::uri($workflow); // 'webhooks/aB3xQ...' (relative, no leading slash)
```

Route middleware is controlled globally via the [`webhook_middleware`](../configuration.md#webhook-middleware) config option (defaults to `['api']`).

## Payload

The entire request body (`$request->all()`) becomes `{{trigger.*}}`.

## Response

```json
{ "execution_id": "...", "status": "succeeded" }
```

The workflow runs synchronously within the request — the response isn't sent until it finishes (or suspends).

## Applying changes

The route is only registered when your application boots. After creating a workflow with a Webhook trigger, or changing its `secret`, restart your application (and any long-running server) for the change to take effect — see [Triggers § Applying trigger changes](overview.md#applying-trigger-changes).
