# Example: Creating a Custom Node

A complete walkthrough: writing a node, registering it, using it in a workflow, and testing it. See [Custom Nodes](../nodes/custom-nodes.md) for the full reference this example draws from.

**Goal:** a node that applies a percentage discount to an amount.

## 1. Write the node

```php
namespace App\Workflows\Nodes;

use Qanna\WorkflowEngine\Engine\Context\WorkflowContext;
use Qanna\WorkflowEngine\Engine\Schema\Schema;
use Qanna\WorkflowEngine\Node;
use Qanna\WorkflowEngine\NodeResult;

class ApplyDiscountNode extends Node
{
    public static function type(): string
    {
        return 'app::pricing.apply-discount';
    }

    public static function label(): string
    {
        return 'Apply discount';
    }

    public static function cliSupported(): bool
    {
        return true;
    }

    public static function schema(): array
    {
        return [
            Schema::number('amount')->required()->help('Supports {{variables}}'),
            Schema::number('percentage')->required()->default(10)->min(0)->max(100),
        ];
    }

    public function handle(WorkflowContext $context, array $config): NodeResult
    {
        $amount = (float) $config['amount'];
        $percentage = (float) $config['percentage'];

        if ($percentage < 0 || $percentage > 100) {
            return NodeResult::fail('Apply discount node: percentage must be between 0 and 100.');
        }

        $discount = round($amount * ($percentage / 100), 2);

        return NodeResult::success([
            'original' => $amount,
            'discount' => $discount,
            'total' => round($amount - $discount, 2),
        ]);
    }
}
```

## 2. Register it

```php
namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Qanna\WorkflowEngine\Engine\NodeRegistry;

class AppServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->app->make(NodeRegistry::class)->register(
            \App\Workflows\Nodes\ApplyDiscountNode::class,
            'math', // any category — see Nodes: Overview § Categories
        );
    }
}
```

It's now available in a [workflow definition](../concepts/workflow-definitions.md) by its type string, and — since `cliSupported()` returns `true` — in the **Math** category of `php artisan workflow:build`'s node picker.

## 3. Use it in a workflow

```php
[
    'id' => 'apply-discount',
    'type' => 'app::pricing.apply-discount',
    'config' => ['amount' => '{{trigger.total}}', 'percentage' => 15],
],
```

Downstream nodes can reference the result as `{{nodes.apply-discount.total}}`.

## 4. Test it

Directly, with no workflow needed (see [Testing § Testing custom nodes directly](../testing/overview.md#testing-custom-nodes-directly)):

```php
use Qanna\WorkflowEngine\Engine\Context\WorkflowContext;

public function test_it_calculates_the_discount(): void
{
    $result = (new ApplyDiscountNode())->handle(
        WorkflowContext::make(),
        ['amount' => 200, 'percentage' => 15],
    );

    $this->assertTrue($result->ok());
    $this->assertSame(['original' => 200.0, 'discount' => 30.0, 'total' => 170.0], $result->getOutput());
}

public function test_it_rejects_an_out_of_range_percentage(): void
{
    $result = (new ApplyDiscountNode())->handle(
        WorkflowContext::make(),
        ['amount' => 200, 'percentage' => 150],
    );

    $this->assertTrue($result->failed());
}
```

Or through a real workflow — see [Testing a Workflow](testing-workflows.md).

## Next

- [Custom Nodes](../nodes/custom-nodes.md) — branching, state, and suspend/resume for more advanced nodes.
- [Dynamic Schema Resolution](../advanced/dynamic-schema.md) — config fields that depend on each other.
