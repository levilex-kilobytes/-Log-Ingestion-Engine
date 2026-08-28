# Log Ingestion Engine

A TypeScript-based backend service for collecting, validating, enriching, queuing, and storing logs from multiple microservices.

The system provides a central pipeline that makes log processing more reliable and easier to manage.

## How It Works

```text
Microservices
      ↓
 HTTP API
      ↓
Rate Limiter
      ↓
 Log Buffer
      ↓
  Validator
      ↓
  Enricher
      ↓
  RabbitMQ
      ↓
  Consumer
      ↓
  SQLite
```

If processing fails, the system retries the operation. Logs that still fail are written to a configurable **Dead Letter File**.

```text
Processing Failure
       ↓
     Retry
       ↓
  Still Failed
       ↓
Dead Letter File
```

## Features

* HTTP log ingestion
* Rate limiting
* Log buffering and batching
* Log validation
* Log enrichment
* RabbitMQ message queue
* SQLite persistence
* Retry mechanism
* Dead letter handling
* Dead letter file rotation
* Environment-based configuration
* Automated testing with Vitest

## Tech Stack

* **TypeScript** — application language
* **Node.js** — runtime
* **Express** — HTTP API
* **RabbitMQ** — message broker
* **SQLite** — database
* **Vitest** — testing
* **Supertest** — API testing
* **dotenv** — environment configuration

## Project Structure

```text
log-ingestion-engine/
├── src/
│   ├── controller/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── repository/
│   ├── consumers/
│   ├── types/
│   └── tests/
├── .env
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd <project-directory>
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file using `.env.example` as a guide.

```env
PORT=<your-port>
NODE_ENV=<your-environment>

RATE_LIMIT=<your-rate-limit>
RATE_LIMIT_WINDOW_MS=<your-window>

RABBITMQ_HOST=<your-rabbitmq-host>
RABBITMQ_PORT=<your-rabbitmq-port>
RABBITMQ_USER=<your-rabbitmq-user>
RABBITMQ_PASS=<your-rabbitmq-password>

DEAD_LETTER_FILE=<your-dead-letter-file>
DEAD_LETTER_MAX_SIZE=<your-max-file-size>
```

Keep `.env` private and never commit it to Git.

## Build

Compile the TypeScript project:

```bash
npm run build
```

## Run

Start the application:

```bash
npm start
```

For development, if the project has a development script:

```bash
npm run dev
```

## Run Tests

Run the complete test suite:

```bash
npm test
```

Run Vitest in watch mode:

```bash
npx vitest
```

Run a specific test:

```bash
npx vitest src/tests/<test-file>.test.ts
```

## Example

A service can send a log to the API:

```json
{
  "level": "<log-level>",
  "message": "<log-message>",
  "service": "<service-name>"
}
```

The log is then:

```text
Received
   ↓
Rate Limited
   ↓
Buffered
   ↓
Validated
   ↓
Enriched
   ↓
Published to RabbitMQ
   ↓
Consumed
   ↓
Stored in SQLite
```

If processing fails after the configured retries, the log is stored in the configured dead letter file.

## Environment Configuration

All important configuration is kept outside the source code.

For example:

```env
DEAD_LETTER_FILE=<your-file>
DEAD_LETTER_MAX_SIZE=<your-size>
```

The application reads these values using:

```ts
process.env.DEAD_LETTER_FILE
process.env.DEAD_LETTER_MAX_SIZE
```

This makes the application easier to configure between development, testing, and production environments.

## Development Workflow

```text
Create feature branch
        ↓
Write code
        ↓
Run tests
        ↓
Build project
        ↓
Commit changes
        ↓
Push branch
        ↓
Open Pull Request
```

## Summary

The Log Ingestion Engine demonstrates how a backend system can reliably handle logs from multiple services.

The main pipeline is:

**Ingest → Limit → Buffer → Validate → Enrich → Queue → Consume → Store**

Failures are handled through **retries and dead-letter storage**, while configuration is managed through environment variables.
