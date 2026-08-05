# Model Trigger

**Type:** `@wf::trigger.model`

Runs a workflow whenever an Eloquent model fires one of its lifecycle events.

## Config

| Field | Type | Notes |
|---|---|---|
| `model` | text, required | Fully-qualified Eloquent model class, e.g. `App\Models\Order`. |
| `events` | checkbox (multi) | Which lifecycle events to listen for: `created`, `updated`, `deleted`, `restored`, `forceDeleted`. |

## Payload

The model's attributes, plus which event fired:

```json
{ "id": 42, "status": "paid", "...": "...", "event": "updated" }
```

(Whatever `$model->toArray()` returns, merged with `event`.)

## Applying changes

The model event listener is only attached when your application boots. After creating a workflow with a Model trigger, or changing its `model`/`events`, restart your application and any queue workers for the change to take effect — see [Triggers § Applying trigger changes](overview.md#applying-trigger-changes).
