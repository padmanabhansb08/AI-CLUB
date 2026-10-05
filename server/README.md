# AI CLUB Backend

## Prerequisites
- Node.js v18+
- PostgreSQL 15+

## Setup
1. Copy `.env.example` to `.env` and fill in secrets.
2. Run `npm install`
3. Run `npm run dev` to start the server.

## Database
- Start PostgreSQL (e.g. using `docker-compose up -d`)
- Migrations: `src/db/migrations/`
- Seeds: `src/db/seeds/`

*Note: Runtime database testing is currently blocked as PostgreSQL/Docker is not available in the development environment.*

## Architecture
- Express.js + TypeScript
- `pg` (node-postgres)
- JWT Authentication
- REST API design with strict authorization middlewares.
