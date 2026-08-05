# Installation

## Requirements

- PHP 8.1+
- Laravel 11 or 12 (`illuminate/support`, `illuminate/http`, `illuminate/console`, `illuminate/contracts`, `illuminate/bus`, `illuminate/queue`)

## Install the package

```bash
composer require qanna-rsa/workflow-engine
```

The package's service provider (`Qanna\WorkflowEngine\WorkflowEngineServiceProvider`) and `Workflow` facade are registered automatically via Laravel's package discovery — no manual registration needed.

## Publish the configuration

```bash
php artisan vendor:publish --tag=workflowengine::config
```

This publishes `config/workflowengine.php`. See [Configuration](configuration.md) for a full reference of every option.

## Publish and run the migrations

Only needed if you plan to use the `database` storage driver for workflows and/or executions (the default is file-based storage, which needs no migrations).

```bash
php artisan vendor:publish --tag=workflowengine::migrations
php artisan migrate
```

This creates three tables: `workflows`, `workflow_executions`, and `workflow_execution_logs` (table names are configurable — see [Configuration](configuration.md)).

## Verify the install

```bash
php artisan list workflow
```

You should see two commands:

- `workflow:build` — interactively create or edit a workflow definition.
- `workflow:run` — run a saved workflow from the terminal.

## Next steps

Continue to [Configuration](configuration.md) to review the available options, or jump straight to the [Quick Start](quickstart.md) to build your first workflow.
