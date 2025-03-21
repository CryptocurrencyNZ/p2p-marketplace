# P2P Marketplace

The Official CryptoCurrencyNZ P2P Marketplace

## Overview

A peer-to-peer marketplace for cryptocurrency transactions built with Next.js, Drizzle ORM, and Web3 technologies.

## Prerequisites

- Node.js 18+ 
- PNPM package manager
- PostgreSQL database (or Neon serverless PostgreSQL)

## Installation

1. Clone the repository
```bash
git clone https://github.com/your-org/p2p-marketplace.git
cd p2p-marketplace
```

2. Install dependencies
```bash
pnpm install
```

3. Set up environment variables
```bash
# Copy the example env file and modify it with your values
cp .env.example .env.local
```

4. Setup AuthJS secret key
```bash
pnpm exec auth secret
```

5. Set up the database
```bash
# Generate Drizzle migrations
pnpm db:generate

# Push migrations to your database
pnpm db:push

# Seed the database with initial data
pnpm db:seed
```

## Development

Start the development server:
```bash
pnpm dev
```

## Database Management

- Generate migrations: `pnpm db:generate`
- Apply migrations: `pnpm db:push`
- View database with Drizzle Studio: `pnpm db:studio`
- Seed the database: `pnpm db:seed`

## Deployment

Build the application for production:
```bash
pnpm build
```

Start the production server:
```bash
pnpm start
```

## License

See [LICENSE](LICENSE) file for details.
