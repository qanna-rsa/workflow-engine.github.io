# Dynamic Schema Resolution

Some config fields can't be described statically — a Model node's `attributes` field, for example, depends entirely on *which* model was chosen in an earlier field. Dynamic schema resolution lets a field's children be generated at prompt time from answers already collected, instead of being fixed in the node's `schema()`.

## The pieces

- **`Schema::group($name)`** — a field whose value is a nested set of other fields (a sub-form), rather than a primitive. Static children are declared with `->fields([...])`.
- **`DynamicSchemaResolver`** — an interface with one method, `resolve(array $answers): array`, returning additional `SchemaField`s based on what's been answered so far. Attached to a group with `->resolver(SomeResolver::class)`.
- **`Schema::dynamic($name, ?$resolver = null)`** — an alias for `Schema::group()` that also accepts a resolver directly as its second argument. Both spellings produce the same field.

A group can have static fields, a resolver, or both — resolver-produced fields are appended after any static ones.

## Example: the built-in Model nodes

[Create record and Update record](../nodes/built-in.md#model) resolve their `attributes` field from the fillable attributes of whichever model class you typed into `model`:

```php
// Qanna\WorkflowEngine\Engine\Nodes\Model\ModelCreateNode
public static function schema(): array
{
    return [
        Schema::text('model')->required(),
        Schema::group('attributes')->resolver(ModelAttributesResolver::class),
    ];
}
```

```php
// Qanna\WorkflowEngine\Engine\Resolvers\ModelAttributesResolver
class ModelAttributesResolver implements DynamicSchemaResolver
{
    public function resolve(array $answers): array
    {
        $modelClass = $answers['model'] ?? null;

        if (! is_string($modelClass) || ! class_exists($modelClass) || ! is_subclass_of($modelClass, Model::class)) {
            return [];
        }

        $model = new $modelClass();
        $casts = $model->getCasts();

        return collect($model->getFillable())
            ->map(fn (string $attribute) => match (true) {
                in_array($casts[$attribute] ?? null, ['int', 'integer', 'float'], true) => Schema::number($attribute),
                in_array($casts[$attribute] ?? null, ['bool', 'boolean'], true) => Schema::checkbox($attribute),
                in_array($casts[$attribute] ?? null, ['array', 'json', 'collection'], true) => Schema::json($attribute),
                default => Schema::text($attribute),
            })
            ->values()
            ->all();
    }
}
```

`$answers` is keyed by field name — here, `$answers['model']` is whatever was typed into the `model` field earlier in the same node's config. In [`workflow:build`](../console/workflow-build.md), choosing `App\Models\Order` for `model` immediately makes the `attributes` step prompt for exactly that model's fillable columns, cast to a sensible field type — with no `Order`-specific code in the node or the command.

## Writing your own resolver

```php
namespace App\Workflows\Resolvers;

use Qanna\WorkflowEngine\Engine\Contracts\DynamicSchemaResolver;
use Qanna\WorkflowEngine\Engine\Schema\Fields\SchemaField;
use Qanna\WorkflowEngine\Engine\Schema\Schema;

class ShippingOptionsResolver implements DynamicSchemaResolver
{
    /** @return array<SchemaField> */
    public function resolve(array $answers): array
    {
        $country = $answers['country'] ?? null;

        return match ($country) {
            'US' => [Schema::select('carrier')->options(['ups' => 'UPS', 'usps' => 'USPS'])],
            'GB' => [Schema::select('carrier')->options(['royal-mail' => 'Royal Mail'])],
            default => [],
        };
    }
}
```

```php
Schema::text('country')->required(),
Schema::group('shipping')->resolver(ShippingOptionsResolver::class),
```

A resolver should be a pure function of `$answers` — it's called every time the group is prompted (or, outside the CLI, whenever your own consuming code decides to resolve it) and should never prompt for input or write to config itself; that's the caller's job.

## Nesting

A resolver can return another `group` field with its own resolver — it resolves recursively, one step at a time, with no special handling required on your part.

## Next

- [Custom Nodes](../nodes/custom-nodes.md) — the rest of the Schema API.
- [Field Builders](field-builders.md) — how `workflow:build` prompts group and resolver-produced fields, including the interactive schema builder used for [Manual Trigger](../triggers/manual.md) payloads.
