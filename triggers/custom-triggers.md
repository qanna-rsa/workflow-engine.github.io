# Custom Triggers

A trigger is a class extending `Qanna\WorkflowEngine\Trigger` (which itself extends `Node` — triggers share the same `type()`/`label()`/`schema()` declaration style covered in [Custom Nodes](../nodes/custom-nodes.md)).

## Example: firing on a Laravel event

```php
namespace App\Workflows\Triggers;

use App\Events\OrderRefunded;
use Illuminate\Support\Facades\Event;
use Qanna\WorkflowEngine\Engine\Context\WorkflowContext;
use Qanna\WorkflowEngine\Engine\Contracts\ExecutionManagerContract;
use Qanna\WorkflowEngine\Engine\Schema\Schema;
use Qanna\WorkflowEngine\Models\Workflow;
use Qanna\WorkflowEngine\Trigger;
use Qanna\WorkflowEngine\TriggerResult;

class OrderRefundedTrigger extends Trigger
{
    public static function type(): string
    {
        return 'app::trigger.order-refunded';
    }

    public static function label(): string
    {
        return 'Order refunded';
    }

    public static function schema(): array
    {
        return [
            Schema::number('minimum_amount')->help('Only fire for refunds at or above this amount.'),
        ];
    }

    public function handle(WorkflowContext $context): TriggerResult
    {
        return TriggerResult::continue($context->get('payload'));
    }

    protected function register(Workflow $workflow): void
    {
        $minimum = $workflow->trigger['config']['minimum_amount'] ?? 0;

        Event::listen(OrderRefunded::class, function (OrderRefunded $event) use ($workflow, $minimum) {
            if ($event->amount < $minimum) {
                return;
            }

            app(ExecutionManagerContract::class)->run(
                $workflow->id,
                ['order_id' => $event->orderId, 'amount' => $event->amount],
                'order-refunded',
            );
        });
    }
}
```

- `schema()` is the trigger's config form — configured per workflow, the same as any node's `config`.
- `register(Workflow $workflow)` is called once per workflow using this trigger type, when your application boots (see [Triggers § How a trigger fires](overview.md#how-a-trigger-fires) and [§ Applying trigger changes](overview.md#applying-trigger-changes)). This is where you wire up whatever makes the trigger actually fire — a route, a cron entry, an event listener, as shown above.
- `handle(WorkflowContext $context)` runs right before the workflow's nodes do, and decides — via `TriggerResult::continue()`/`::ignore()` — whether the workflow proceeds. `$context->get('payload')` is whatever was passed in when the run was started (e.g. the array passed to `app(ExecutionManagerContract::class)->run()` above). Most triggers simply pass it straight through; use `TriggerResult::ignore()` here for any condition that couldn't be checked before the run started.

## Registering it

```php
use Qanna\WorkflowEngine\Engine\NodeRegistry;

public function boot(): void
{
    $this->app->make(NodeRegistry::class)->register(
        \App\Workflows\Triggers\OrderRefundedTrigger::class,
        'trigger',
    );
}
```

Register it in your own service provider's `boot()`, after the package's own provider has run (Laravel handles provider ordering for you as long as you don't register it in a provider loaded before `WorkflowEngineServiceProvider`).

## Using it in a workflow definition

```php
'trigger' => [
    'type' => 'app::trigger.order-refunded',
    'config' => ['minimum_amount' => 50],
],
```

## Making it available in `workflow:build`

Like nodes, triggers are opt-in for the interactive builder — implement `cliSupported(): true` to have it offered in the trigger picker. See [Custom Nodes § Making it available in workflow:build](../nodes/custom-nodes.md#making-it-available-in-workflowbuild).
