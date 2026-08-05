# Built-in Nodes

Every node listed here is registered automatically — reference it by its **Type** string in a [workflow definition](../concepts/workflow-definitions.md), or add it through `php artisan workflow:build` if it's marked **CLI**. Config fields marked **required** must be provided; all others are optional. Text-shaped fields generally accept [expressions](../concepts/expressions.md) (`{{ }}`) — noted per field where relevant.

## Action

### Log — `@wf::action.log` · CLI

Writes to the application log.

| Field | Type | Notes |
|---|---|---|
| `level` | select | `debug`, `info` (default), `warning`, `error`. |
| `message` | text, required | Supports expressions. |

Output: `{level, message}`.

### Wait — `@wf::action:wait` · CLI

Suspends the execution for a duration, or until an absolute time, then resumes automatically.

| Field | Type | Notes |
|---|---|---|
| `duration` | number | Seconds to wait. Default `60`. Ignored if `until` is set. |
| `until` | text | Absolute date/time to resume at, e.g. `2026-01-01T00:00:00Z`. Supports expressions. |

Output on resume: `{until}` (ISO 8601).

### Stop — `@wf::action:stop` · CLI

Ends the workflow.

| Field | Type | Notes |
|---|---|---|
| `outcome` | select | `success` (default, ends as `Cancelled`) or `failure` (ends as `Failed`). |
| `message` | text | Required when `outcome` is `failure`; recorded as the error/output message. |
| `output` | json | Extra output data, only used when `outcome` is `success`. Supports expressions. |

### Do nothing — `@wf::action.do-nothing` · CLI

A no-op — always succeeds with no output. Useful as an explicit placeholder branch target.

### Scope — `@wf::action:scope`

Groups a run of nodes: enters its `body` branch, and once that branch is exhausted, continues from Scope's own `main` edge. Not currently offered in the interactive builder.

| Field | Type | Notes |
|---|---|---|
| `data` | json | Optional data made available to the scope. Supports expressions. |

### Call workflow — `@wf::action:call-workflow`

Runs another workflow as a child and suspends until it finishes, then resumes with the child's output. Not currently offered in the interactive builder.

| Field | Type | Notes |
|---|---|---|
| `workflow_id` | select, required | Any workflow using a [Manual trigger](../triggers/manual.md). |
| `payload` | json | Data passed as the child's trigger payload. Supports expressions. |

Output: the child workflow's output. Fails if the child workflow fails or is cancelled.

### HTTP request — `@wf::http:request`

Makes an outbound HTTP call. Not currently offered in the interactive builder.

| Field | Type | Notes |
|---|---|---|
| `url` | text, required | Supports expressions. |
| `method` | select | `get` (default), `post`, `put`, `patch`, `delete`, `head`. |
| `headers` | json | Map of header name to value. |
| `query` | json | Map of query string parameters. |
| `body` | json | Sent as the JSON request body. Shown only for `post`/`put`/`patch`/`delete`. |
| `timeout` | number | Seconds, default `30`. |
| `fail_on_error` | checkbox | Default `true` — fail this node on a 4xx/5xx response. |

Output: `{status, ok, headers, body}`.

## Logic

### Condition — `@wf::logic:condition` · CLI

Branches on a comparison. Produces branch `true` or `false`.

| Field | Type | Notes |
|---|---|---|
| `field` | text, required | Dot-notation path into context, e.g. `trigger.role`. |
| `operator` | select | `==`, `===`, `!=`, `>`, `>=`, `<`, `<=`, `contains`, `not_contains`, `starts_with`, `ends_with`, `in`, `not_in`, `is_null`, `is_not_null`, `is_empty`, `is_not_empty`. Default `==`. |
| `value` | text | The comparison value. Supports expressions. Hidden for the `is_*` operators. |

Output: `{actual, operator, expected, result, branch}`.

### For each — `@wf::logic:loop` · CLI

Iterates an array, running its `body` branch once per element, then continues on `main` once exhausted.

| Field | Type | Notes |
|---|---|---|
| `source` | text, required | Dot-notation path to an array in context, e.g. `nodes.query.result`. |

Inside the body branch, the current element is available as `{{loop.item}}` and its index as `{{loop.index}}`. Output on the `main` branch: `{iterations}`.

### Switch — `@wf::logic:switch`

Branches on a value against a list of cases. Not currently offered in the interactive builder (case branches are configured dynamically).

| Field | Type | Notes |
|---|---|---|
| `field` | text, required | Value to switch on. Supports expressions. |
| `cases` | json, required | Array of `{value, branch}` pairs, e.g. `[{"value": "paid", "branch": "paid"}]`. First match wins. |
| `strict` | checkbox | Use `===` instead of `==`. Default `false`. |

Falls through to branch `default` if no case matches.

## Variables

All five read/write the execution context by dot-notation path — the same context [expressions](../concepts/expressions.md) read from.

| Node | Type | CLI | Config | Output |
|---|---|---|---|---|
| Set variable | `@wf::variables:set` | ✅ | `key` (text, required), `value` (json) | `{key, value}` |
| Get variable | `@wf::variables:get` | ✅ | `key` (text, required), `default` (json) | `{value}` |
| Increment variable | `@wf::variables:increment` | ✅ | `key` (text, required), `amount` (number, default `1`) | `{value}` |
| Append to variable | `@wf::variables:append` | ✅ | `key` (text, required), `value` (json) | `{value}` — the array after appending |
| Remove variable | `@wf::variables:remove` | ✅ | `key` (text, required) | `{key}` |

## Model

Operate on Eloquent models directly. `model` is a fully-qualified model class name, e.g. `App\Models\Order`.

### Create record — `@wf::model.create` · CLI

| Field | Type | Notes |
|---|---|---|
| `model` | text, required | |
| `attributes` | group | Populated dynamically from the model's fillable attributes — see [Dynamic Schema Resolution](../advanced/dynamic-schema.md). |

Output: the created record's attributes.

### Update record — `@wf::model.update` · CLI

| Field | Type | Notes |
|---|---|---|
| `model` | text, required | |
| `key` | text | Column to find the record by. Default `id`. |
| `value` | text, required | Value to match against `key`. Supports expressions. |
| `attributes` | group | Same dynamic resolution as Create record. |

Fails if no matching record is found. Output: the updated record's fresh attributes.

### Delete record — `@wf::model.delete` · CLI

| Field | Type | Notes |
|---|---|---|
| `model` | text, required | |
| `key` | text | Column to find the record by. Default `id`. |
| `value` | text, required | Value to match against `key`. Supports expressions. |

Fails if no matching record is found.

## Files

Operate on a Laravel filesystem disk (defaults to `filesystems.default`).

| Node | Type | CLI | Config | Output |
|---|---|---|---|---|
| Read file | `@wf::files:read` | ✅ | `path` (text, required), `disk` (select) | `{path, contents}` |
| Write file | `@wf::files:write` | ✅ | `path` (text, required), `contents` (textarea), `mode` (select: `overwrite`/`append`), `disk` (select) | `{path, size}` |
| Delete file | `@wf::files:delete` | ✅ | `path` (text, required), `disk` (select) | `{path, deleted}` |

`path` and `contents` support expressions.

## Data

None of these are currently offered in the interactive builder — use them by hand-writing the definition.

| Node | Type | Config | Output |
|---|---|---|---|
| Parse JSON | `@wf::data:json-parse` | `input` (text, required) | `{result}` |
| Stringify JSON | `@wf::data:json-stringify` | `input` (json, required), `pretty` (checkbox) | `{result}` |
| Select data | `@wf::data:select` | `source` (json, required), `path` (text, required), `default` (json) | `{result}` |
| Merge data | `@wf::data:merge` | `a` (json, required), `b` (json, required — overrides `a`), `deep` (checkbox) | `{result}` |
| Flatten data | `@wf::data:flatten` | `source` (json, required), `depth` (number — blank = fully flatten) | `{result}` |

## Collections

Operate on an array in `source`. Where present, `field` is a dot-notation path evaluated within each element (blank compares the element itself). None are currently offered in the interactive builder.

| Node | Type | Config | Output |
|---|---|---|---|
| Filter collection | `@wf::collections:filter` | `source` (json, required), `field` (text), `operator` (select — same set as [Condition](#logic)), `value` (text) | `{result, count}` |
| Map collection | `@wf::collections:map` | `source` (json, required), `field` (text) | `{result}` |
| Reduce collection | `@wf::collections:reduce` | `source` (json, required), `operation` (select: `sum`/`avg`/`min`/`max`/`count`/`concat`), `field` (text), `separator` (text, for `concat`) | `{result}` |
| Sort collection | `@wf::collections:sort` | `source` (json, required), `field` (text), `direction` (select: `asc`/`desc`) | `{result}` |
| Collection contains | `@wf::collections:contains` | `source` (json, required), `field` (text), `operator` (select), `value` (text) | `{result}` (boolean) |
| Count collection | `@wf::collections:count` | `source` (json, required) | `{count}` |

## Text

Operate on `subject`. None are currently offered in the interactive builder.

| Node | Type | Config | Output |
|---|---|---|---|
| Concat text | `@wf::text:concat` | `parts` (json, required — array of values), `separator` (text) | `{result}` |
| Replace text | `@wf::text:replace` | `subject` (text, required), `search` (text, required), `replace` (text) | `{result}` |
| Split text | `@wf::text:split` | `subject` (text, required), `delimiter` (text, default `,`; blank splits into characters) | `{result, count}` |
| Trim text | `@wf::text:trim` | `subject` (text, required), `characters` (text; default whitespace) | `{result}` |
| Uppercase text | `@wf::text:uppercase` | `subject` (text, required) | `{result}` |
| Lowercase text | `@wf::text:lowercase` | `subject` (text, required) | `{result}` |
| Format text | `@wf::text:format` | `template` (text, required — `{placeholder}` tokens), `values` (json — map of placeholder to value) | `{result}` |

All `subject`/`template`/`values` fields support expressions.

## Date/Time

Dates are parsed with Carbon, so any format Carbon understands is accepted as input. None are currently offered in the interactive builder.

| Node | Type | Config | Output |
|---|---|---|---|
| Current date/time | `@wf::datetime:now` | `format` (text — blank = ISO 8601), `timezone` (text — blank = app timezone) | `{result}` |
| Add to date | `@wf::datetime:add` | `date` (text, required), `amount` (number, required, default `1`), `unit` (select: seconds/minutes/hours/days/weeks/months/years) | `{result}` (ISO 8601) |
| Subtract from date | `@wf::datetime:subtract` | Same fields as Add | `{result}` (ISO 8601) |
| Format date | `@wf::datetime:format` | `date` (text, required), `format` (text, required, default `Y-m-d H:i:s` — PHP date format) | `{result}` |
| Date difference | `@wf::datetime:difference` | `start` (text, required), `end` (text, required), `unit` (select) | `{result}` (integer, positive when `end` is after `start`) |

## Math

Operate on numbers. None are currently offered in the interactive builder.

| Node | Type | Config | Output |
|---|---|---|---|
| Add | `@wf::math:add` | `a`, `b` (number, required, default `0`) | `{result}` |
| Subtract | `@wf::math:subtract` | `a`, `b` (number, required, default `0`) | `{result}` |
| Multiply | `@wf::math:multiply` | `a`, `b` (number, required, default `0`) | `{result}` |
| Divide | `@wf::math:divide` | `a` (default `0`), `b` (default `1`) — fails on `b = 0` | `{result}` |
| Round | `@wf::math:round` | `value` (number, required), `precision` (number, default `0`) | `{result}` |
| Minimum | `@wf::math:min` | `values` (json, required — non-empty array) | `{result}` |
| Maximum | `@wf::math:max` | `values` (json, required — non-empty array) | `{result}` |

## Next

- [Custom Nodes](custom-nodes.md) — build your own.
- [Triggers](../triggers/overview.md) — what starts a workflow.
