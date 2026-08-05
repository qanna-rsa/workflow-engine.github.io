# Expressions

Node and trigger `config` values can reference data produced earlier in the workflow using `{{ }}` expressions. Any `config` field whose help text says "Supports `{{variables}}`" accepts this syntax.

```php
'message' => 'Welcome {{trigger.name}}, your order #{{trigger.order_id}} is confirmed.'
```

## Referencing data

An expression is a dot-notation path into the execution context:

| Path | Refers to |
|---|---|
| `trigger.*` | The payload the trigger fired with (`{{trigger.email}}`). |
| `nodes.<node-id>.*` | The output of a previously-executed node, keyed by its `id` in the workflow definition (`{{nodes.check-age.result}}`). |
| `loop.*` | Inside a [Loop node](../nodes/built-in.md#logic)'s body branch: `loop.item` (the current element) and `loop.index`. |

A value that is *entirely* one expression (e.g. `{{trigger.order}}`) resolves to the underlying value with its original type preserved — an array stays an array, a number stays a number. A value with surrounding text (e.g. `"Order #{{trigger.order_id}}"`) is resolved as a string, with arrays JSON-encoded inline.

## Method chains

Append `.method()` calls after the path to transform the value before it's used:

```php
{{trigger.email.lower()}}
{{nodes.query.result.first().name}}
{{trigger.tags.join(", ")}}
```

Arguments are comma-separated and may be string literals (`'...'` or `"..."`), numbers, `true`, `false`, or `null`.

### Array methods

| Method | Description |
|---|---|
| `first()` / `last()` | First / last element. |
| `count()` / `length()` | Number of elements (or string length, for `length()` on a string). |
| `keys()` / `values()` | Array keys / re-indexed values. |
| `reverse()` | Reversed array (or reversed string). |
| `unique()` | Deduplicated values. |
| `flatten()` | Fully flattens nested arrays. |
| `sum()` / `min()` / `max()` / `avg()` | Aggregate over the array's values. |
| `nth(i)` | Element at index `i`. |
| `skip(n)` / `take(n)` | Drop / keep the first `n` elements. |
| `pluck(key)` | Extract `key` from every element. |
| `filter(field, operator, value)` | Keep elements where `field` compares to `value` using `operator` (`==`, `!=`, `>`, `>=`, `<`, `<=`, `in`). |
| `join(separator)` | Implode into a string (default separator `, `). |
| `sort()` | Sorted ascending. |

### String methods

| Method | Description |
|---|---|
| `upper()` / `lower()` | Uppercase / lowercase. |
| `trim()` / `ltrim()` / `rtrim()` | Trim whitespace (or the given characters). |
| `camelCase()` / `snake_case()` / `kebab()` / `studly()` / `title()` | Case conversion. |
| `slug(separator = '-')` | URL-friendly slug. |
| `limit(length = 100, end = '...')` | Truncate with a suffix. |
| `start(prefix)` / `finish(suffix)` | Ensure the string starts/ends with the given value. |
| `before(needle)` / `after(needle)` | Substring before/after the first occurrence. |
| `contains(needle)` / `startsWith(needle)` / `endsWith(needle)` | Boolean substring checks. |
| `replace(search, replace)` | `str_replace`. |
| `split(delimiter = ',')` | Explode into an array. |
| `words()` | Word count. |
| `pad(length, pad = ' ')` | `str_pad`. |
| `repeat(times = 1)` | Repeat the string. |
| `substr(start, length?)` | Substring. |
| `indexOf(needle)` | Position of the first occurrence, or `false`. |
| `wrap(before, after = before)` | Wrap with the given prefix/suffix. |

### Number methods

| Method | Description |
|---|---|
| `add(n)` / `sub(n)` / `mul(n)` / `div(n)` / `mod(n)` | Arithmetic. |
| `abs()` / `ceil()` / `floor()` / `round(precision = 0)` | Rounding. |
| `clamp(min, max)` | Constrain to a range. |
| `format(decimals = 2, decimalPoint = '.', thousandsSep = ',')` | `number_format`. |

### Type methods

| Method | Description |
|---|---|
| `string()` / `int()` / `float()` / `bool()` | Cast. |
| `json()` | JSON-encode. |
| `decode()` | JSON-decode (into an array). |
| `fallback(default)` | The value, or `default` if it's `null`. |
| `isset()` | `true` if the value isn't `null`. |
| `empty()` | PHP's `empty()`. |
| `not()` | Boolean negation. |
| `if(then, else = false)` | `then` if the value is truthy, else `else`. |

### Date methods

| Method | Description |
|---|---|
| `date(format = 'Y-m-d')` | Parses the value with Carbon and formats it. |
| `time(format = 'H:i:s')` | Same, defaulting to a time format. |
| `now(format = 'Y-m-d H:i:s')` | The current date/time (ignores the base value). |

Any unrecognized method throws — expressions fail loudly rather than silently returning `null`, so a typo in a workflow's config is caught immediately when that node runs.

## Using expressions from a custom node

Node `config` is resolved for you before your node's `handle()` runs — by the time you receive `$config`, every `{{ }}` expression in it has already been evaluated (see [Custom Nodes](../nodes/custom-nodes.md)). Inside `handle()`, `WorkflowContext` also exposes the same dot-notation resolution directly if you need to read something outside your node's own `$config`:

```php
public function handle(WorkflowContext $context, array $config): NodeResult
{
    $email = $context->get('trigger.email');
    $default = $context->get('trigger.plan', 'free'); // with a fallback
    // ...
}
```

`$context->set('key.path', $value)` and `$context->forget('key.path')` write to the context the same way — this is what the built-in [Variable nodes](../nodes/built-in.md#variables) use.

## Next

- [Built-in Nodes](../nodes/built-in.md) — see each node's config fields for where expressions are commonly used.
- [Custom Nodes](../nodes/custom-nodes.md) — building your own nodes.
