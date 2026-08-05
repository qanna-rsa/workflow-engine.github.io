# Example: Testing a Workflow

A complete test for a piece of application code that triggers a workflow, using `Workflow::fake()`. See [Testing](../testing/overview.md) for the full assertion reference.

**Scenario:** a `UserController@store` method that creates a user and runs the `send-welcome-email` workflow ([built in the Quick Start](../quickstart.md)) with the new user's email.

```php
// app/Http/Controllers/UserController.php
use Qanna\WorkflowEngine\Facades\Workflow;

class UserController
{
    public function store(Request $request)
    {
        $user = User::create($request->validated());

        Workflow::run('send-welcome-email', ['email' => $user->email]);

        return response()->json($user, 201);
    }
}
```

## The test

```php
use Qanna\WorkflowEngine\Engine\Nodes\Action\LogNode;
use Qanna\WorkflowEngine\Engine\Triggers\ManualTrigger;
use Qanna\WorkflowEngine\Facades\Workflow;
use Qanna\WorkflowEngine\Models\Workflow as WorkflowModel;
use Qanna\WorkflowEngine\Storage\Contracts\WorkflowRepositoryContract;

class UserControllerTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Persist the real workflow definition — Workflow::fake() only
        // fakes execution storage, not workflow definitions.
        app(WorkflowRepositoryContract::class)->create(WorkflowModel::fromArray([
            'id' => 'send-welcome-email',
            'name' => 'Send Welcome Email',
            'trigger' => ['type' => ManualTrigger::type(), 'config' => []],
            'nodes' => [[
                'id' => 'log',
                'type' => LogNode::type(),
                'config' => ['message' => 'Welcome {{trigger.email}}'],
            ]],
            'edges' => [['from' => 'trigger', 'to' => 'log', 'branch' => 'main']],
        ]));
    }

    public function test_creating_a_user_runs_the_welcome_workflow(): void
    {
        Workflow::fake();

        $this->postJson('/users', ['name' => 'Ada', 'email' => 'ada@example.com'])
            ->assertCreated();

        Workflow::assertRan('send-welcome-email');
        Workflow::assertWorkflowRanTimes('send-welcome-email', 1);
    }

    public function test_the_workflow_actually_completes_successfully(): void
    {
        Workflow::fake();

        $this->postJson('/users', ['name' => 'Ada', 'email' => 'ada@example.com']);

        $execution = Workflow::runs()[0];

        Workflow::assertCompleted($execution->id);
        $this->assertContains('log', $execution->logs->pluck('nodeId')->all());
    }
}
```

The first test only cares that the right workflow ran. The second goes further — because `Workflow::fake()` still executes the real engine (see [Testing § What faking does (and doesn't) change](../testing/overview.md#what-faking-does-and-doesnt-change)), you can assert the workflow didn't just get called, but actually completed successfully and ran the node you expect.

## Testing a workflow that suspends

A workflow using [Wait](../nodes/built-in.md#action) or [Call workflow](../nodes/built-in.md#action) still runs to completion inline under `fake()` (see [Testing § What faking does (and doesn't) change](../testing/overview.md#what-faking-does-and-doesnt-change)) — no need to manually advance time or run a queue worker in the test:

```php
Workflow::fake();

$execution = Workflow::run('remind-after-delay', ['user_id' => 1]);

Workflow::assertCompleted($execution->id);
```

If you need to assert an execution is genuinely left suspended (rather than resolved inline), send it through a real trigger flow that suspends on a condition your test controls, and assert `Workflow::assertSuspended($execution->id)` instead.

## Next

- [Testing](../testing/overview.md) — the full assertion and inspection API.
- [Creating a Custom Node](custom-node.md) — testing a node's `handle()` directly.
