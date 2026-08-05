# Field Builders

This page is the full reference for the `Schema` fluent API used to declare node and trigger config forms, and for the interactive builders `workflow:build` uses to prompt for them.

## The Schema API

Every field is created via a static `Schema::` method and configured fluently:

```php
use Qanna\WorkflowEngine\Engine\Schema\Schema;

Schema::text('email')->required()->placeholder('you@example.com');
```

### Field types

| Method | Produces | Notes |
|---|---|---|
| `Schema::text($name)` | Single-line text | `->multiline()` switches it to a textarea. `->mono()` hints at a monospace input. |
| `Schema::number($name)` | Numeric input | `->min()`, `->max()`, `->step()`. |
| `Schema::select($name)` | Single choice | `->options(['key' => 'Label', ...])`, `->multiple()` for a multi-select. |
| `Schema::checkbox($name)` | Boolean, or multi-choice | With no `->options()`, a plain yes/no toggle. With `->options([...])`, a multi-select whose result is stored as `{key: true, ...}` for each chosen key. |
| `Schema::json($name)` | Arbitrary JSON-compatible value | See [The Interactive JSON Builder](#the-interactive-json-builder) below. |
| `Schema::date($name)` / `Schema::datetime($name)` | A date / date-time value | |
| `Schema::email($name)` | An email address | |
| `Schema::password($name)` | A sensitive value | Automatically marked `->sensitive()`. |
| `Schema::group($name)` | A nested sub-form | `->fields([...])` for static children, `->resolver(SomeResolver::class)` for dynamically-generated ones — see [Dynamic Schema Resolution](dynamic-schema.md). `Schema::dynamic($name, $resolver = null)` is an alias. |
| `Schema::builder($name)` | A field whose value is itself a schema | See [The Interactive Schema Builder](#the-interactive-schema-builder-payload-fields) below. Used by [Manual Trigger](../triggers/manual.md)'s `payload` field. |
| `Schema::whereBuilder($name)` / `Schema::filterBuilder($name)` | A structured filter/where clause | `->operators([...])`. Not currently prompted by `workflow:build` — falls back to the field's default. |

### Common fluent methods

Available on every field type:

| Method | Effect |
|---|---|
| `->label(string)` | Display label. Defaults to a title-cased version of the field name. |
| `->required(bool = true)` | Marks the field required. |
| `->help(string)` | Help text shown alongside the prompt. |
| `->placeholder(string)` | Placeholder / example value. |
| `->default(mixed)` | Default value when nothing else is provided. |
| `->value(mixed)` | A fixed value — combine with `->disabled()` for a computed, non-editable field. |
| `->sensitive(bool = true)` | Marks the field as holding sensitive data (e.g. a secret). |
| `->hidden(bool = true)` | Excluded entirely from prompting. |
| `->disabled(bool = true)` | Not prompted — uses its existing/`value`/`default` as-is. |
| `->rules(array\|string)` | Validation rules, in the same format as Laravel's validator. |
| `->when(string $field, mixed $value)` | Only shown when the named sibling field (already answered) equals `$value` (or is one of the values in an array). |
| `->handle(callable)` | Defer part of the field's definition to a closure, resolved when the schema is read — e.g. populating `->options()` from a database query. Receives the field instance; return it (after mutating) or an array to merge in. |

## The Interactive JSON Builder

Every `json` field, wherever it's prompted by `workflow:build`, offers a choice:

```
How would you like to provide this value?
❯ Build interactively
  Paste JSON
```

**Paste JSON** is a plain text prompt — type or paste a JSON value directly, or a `{{ template }}` [expression](../concepts/expressions.md) (template references are only available through this option).

**Build interactively** launches a recursive object builder:

```
Current object
{}

What would you like to do?
❯ Add property
  Finish
```

Adding a property asks for a **name**, a **value type** (String, Number, Boolean, Null, Object, or Array), and then the value itself — choosing Object or Array recurses into a nested builder of the same shape. The current object (or array) is re-printed after every change, so you can see exactly what you've built so far before deciding whether to add more or finish.

## The Interactive Schema Builder (payload fields)

A `builder` field — like [Manual Trigger](../triggers/manual.md)'s `payload` — doesn't collect a value at all; it collects a *schema*, the same `array<SchemaField>` shape any node's `schema()` returns:

```
Add a field?
❯ Yes

Field name: customer
Field type: Text
Required?: Yes

Add another?
❯ Yes

Field name: priority
Field type: Select
Required?: No
```

After the common **name / type / required** questions, a field type is given the chance to finish configuring itself before being added:

- **Select** launches a small loop collecting `Key` / `Label` pairs (`Add option?` → `Add another?` → ...), producing the same `->options([...])` map you'd write in code.
- **JSON** launches [the JSON builder](#the-interactive-json-builder) described above, to interactively construct a default value.
- Every other type (Text, Number, Boolean, Date, DateTime, Email, Password) needs no further configuration and is added immediately.

The result is a plain array of field definitions — exactly what [`ModelAttributesResolver`](dynamic-schema.md#example-the-built-in-model-nodes) or your own [`DynamicSchemaResolver`](dynamic-schema.md) returns, just built by hand instead of computed. See [Manual Trigger § Config](../triggers/manual.md#config) for how a designed payload shape is later used to prompt for real values in `workflow:run`.

## Next

- [Dynamic Schema Resolution](dynamic-schema.md) — resolver-driven fields.
- [Custom Nodes](../nodes/custom-nodes.md) — using these fields in your own node's `schema()`.
