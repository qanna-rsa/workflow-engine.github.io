import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import CodeBlock from '@theme/CodeBlock';

import styles from './index.module.css';

const FEATURES = [
  {
    title: 'Trigger-driven execution',
    description:
      'Manual, Webhook, Schedule (cron), and Eloquent Model event triggers included out of the box.',
  },
  {
    title: 'A large built-in node library',
    description:
      'Logic (condition, switch, loop), variables, HTTP, files, Eloquent model CRUD, math, text, date/time, and collection operations.',
  },
  {
    title: 'An expression language',
    description:
      'Reference trigger and node output with chained helper methods: {{ trigger.email }}, {{ nodes.query.result.first() }}.',
  },
  {
    title: 'Suspend and resume',
    description:
      'Nodes like Wait and Call Workflow can suspend an execution and resume it later without re-running earlier steps.',
  },
  {
    title: 'Pluggable storage',
    description:
      'File-based (git-friendly) or database-backed storage for workflows and executions, configured independently.',
  },
  {
    title: 'First-class testing support',
    description:
      'Workflow::fake() and a set of assertions for testing that your app triggers workflows correctly.',
  },
];

const EXPLORE_LINKS = [
  {title: 'Concepts', description: 'Workflows, definitions, execution and expressions.', to: '/docs/concepts/workflows'},
  {title: 'Nodes', description: 'The built-in node library, and how to write your own.', to: '/docs/nodes/overview'},
  {title: 'Triggers', description: 'Manual, Webhook, Schedule, and Model triggers.', to: '/docs/triggers/overview'},
  {title: 'Console', description: 'The interactive workflow:build command.', to: '/docs/console/overview'},
  {title: 'Testing', description: 'Workflow::fake() and assertions.', to: '/docs/testing/overview'},
  {title: 'Advanced', description: 'Dynamic schemas, field builders, extension points.', to: '/docs/advanced/advanced-configuration'},
  {title: 'API Reference', description: 'The Workflow facade and core contracts.', to: '/docs/api/facade'},
  {title: 'Examples', description: 'Full, worked walkthroughs.', to: '/docs/examples/first-workflow'},
];

const INSTALL_SNIPPET = `composer require qanna-rsa/workflow-engine
php artisan vendor:publish --tag=workflowengine::config`;

const QUICK_START_SNIPPET = `php artisan workflow:build
php artisan workflow:run send-welcome-email --payload='{"email":"ada@example.com"}'`;

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className="container">
        <span className={styles.heroEyebrow}>For Laravel 11 &amp; 12</span>
        <Heading as="h1" className={styles.heroTitle}>
          {siteConfig.title}
        </Heading>
        <p className={styles.heroSubtitle}>{siteConfig.tagline}</p>
        <p className={styles.heroLead}>
          Define workflows as a trigger followed by a graph of nodes, and run
          them synchronously, asynchronously, or from the command line —
          without shipping a UI.
        </p>
        <div className={styles.buttons}>
          <Link className="button button--primary button--lg" to="/docs/introduction">
            Get Started
          </Link>
          <Link
            className={clsx('button button--lg', styles.ghostButton)}
            href="https://github.com/qanna-rsa/workflow-engine">
            GitHub
          </Link>
        </div>
      </div>
    </header>
  );
}

function Features() {
  return (
    <section className={styles.section}>
      <div className="container">
        <Heading as="h2" className={styles.sectionTitle}>
          Why Workflow Engine
        </Heading>
        <p className={styles.sectionSubtitle}>
          A headless workflow automation engine that's a Composer package,
          not a hosted product — you bring the interface, it brings the
          execution engine, node library, storage, and testing tools.
        </p>
        <div className={clsx('row', styles.featureGrid)}>
          {FEATURES.map((feature) => (
            <div key={feature.title} className={clsx('col col--4', styles.featureCol)}>
              <div className={styles.featureCard}>
                <Heading as="h3" className={styles.featureTitle}>
                  {feature.title}
                </Heading>
                <p className={styles.featureDescription}>{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function GetStarted() {
  return (
    <section className={clsx(styles.section, styles.sectionAlt)}>
      <div className="container">
        <div className="row">
          <div className="col col--6">
            <Heading as="h2" className={styles.sectionTitle}>
              Installation
            </Heading>
            <p className={styles.sectionSubtitle}>
              Add the package to an existing Laravel application and publish
              its config.
            </p>
            <CodeBlock language="bash">{INSTALL_SNIPPET}</CodeBlock>
            <p>
              <Link to="/docs/installation">Full installation guide →</Link>
            </p>
          </div>
          <div className="col col--6">
            <Heading as="h2" className={styles.sectionTitle}>
              Quick Start
            </Heading>
            <p className={styles.sectionSubtitle}>
              Build a workflow interactively, then run it from the terminal
              or your application code.
            </p>
            <CodeBlock language="bash">{QUICK_START_SNIPPET}</CodeBlock>
            <p>
              <Link to="/docs/quickstart">Full quick start guide →</Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Explore() {
  return (
    <section className={styles.section}>
      <div className="container">
        <Heading as="h2" className={styles.sectionTitle}>
          Explore the docs
        </Heading>
        <div className={clsx('row', styles.featureGrid)}>
          {EXPLORE_LINKS.map((link) => (
            <div key={link.title} className={clsx('col col--3', styles.featureCol)}>
              <Link to={link.to} className={styles.exploreCard}>
                <Heading as="h3" className={styles.featureTitle}>
                  {link.title}
                </Heading>
                <p className={styles.featureDescription}>{link.description}</p>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description="workflow-engine is a headless workflow automation engine for Laravel: define triggers and a graph of nodes, and execute them synchronously, asynchronously, or from the command line.">
      <HomepageHeader />
      <main>
        <Features />
        <GetStarted />
        <Explore />
      </main>
    </Layout>
  );
}
