# Introduction

**workflow-engine** is a headless workflow automation engine for Laravel. It lets you define workflows — a trigger followed by a graph of nodes — and execute them synchronously, asynchronously, or from the command line, without shipping a UI.

A workflow is a small JSON-shaped definition:

- A **trigger** decides when a workflow should run (manually, on a webhook, on a schedule, or on an Eloquent model event).
- **Nodes** are the steps the workflow performs (log a message, call an HTTP endpoint, update a database record, branch on a condition, loop over a collection, and more).
- **Edges** connect nodes together, optionally along a named branch (e.g. a Condition node's `true`/`false` outcomes).

Workflows are stored as data (file or database), not code, so they can be authored interactively, generated programmatically, or edited by a future UI — the engine itself doesn't care how the definition was produced.

## Why headless?

Most workflow builders ship as a full product: a visual canvas, a hosted runtime, an opinionated UI. workflow-engine is the opposite — it's a Composer package you add to an existing Laravel application. You bring the interface (a console command is included, and the same public API can power a custom UI); the package provides the execution engine, node library, storage, and testing tools.

## Features

- **Trigger-driven execution** — Manual, Webhook, Schedule (cron), and Eloquent Model event triggers included.
- **A large built-in node library** — logic (condition, switch, loop), variables, HTTP, files, Eloquent model CRUD, math, text, date/time, and collection operations.
- **An expression language** — reference trigger/node output and call chained helper methods with `{{ trigger.email }}`, `{{ nodes.query.result.first() }}`, etc.
- **Suspend and resume** — nodes like Wait and Call Workflow can suspend an execution and resume it later without re-running earlier steps.
- **Pluggable storage** — file-based (git-friendly) or database-backed storage for workflows and executions, configured independently.
- **An interactive builder** — `php artisan workflow:build` walks you through constructing a workflow definition from the terminal, including a full interactive JSON builder.
- **A fluent schema API for custom nodes** — declare a node's configuration form with `Schema::text()`, `Schema::select()`, `Schema::group()`, and friends, including fields whose options resolve dynamically at prompt time.
- **First-class testing support** — `Workflow::fake()` and a set of assertions for testing that your application triggers workflows correctly, without needing to assert on the workflow's internals.

## Where to go next

- [Installation](installation.md) to add the package to your app.
- [Quick Start](quickstart.md) to build and run your first workflow in a few minutes.
- [Workflows](concepts/workflows.md) to understand the core concepts.
