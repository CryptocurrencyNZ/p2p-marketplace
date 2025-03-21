# P2P Chat API

A secure peer-to-peer chat application with PostgreSQL and Drizzle ORM.

## Features

- Secure user authentication with JWT
- Message encryption (client-side)
- Message expiration (24-hour deletion)
- User blocking capability
- Real-time messaging
- Type-safe database queries with Drizzle ORM

## Tech Stack

- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Drizzle ORM (compatible with Neon)
- **Authentication**: JWT with bcrypt for password hashing
- **Real-time**: WebSockets

## Setup

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (or Neon account)

### Installation

1. Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd p2p-marketplace
npm install
```

2. Create a `.env` file in the project root with the following variables:

```
DATABASE_URL=postgres://user:password@host:port/database
JWT_SECRET=your-secure-secret-key
MESSAGE_EXPIRATION_HOURS=24
```

For local PostgreSQL setup, your DATABASE_URL might look like:
```
DATABASE_URL=postgres://postgres:postgres@localhost:5432/chat_app
```

For Neon, it would look like:
```
DATABASE_URL=postgres://user:password@endpoint:5432/neondb
```

3. Initialize the database:

```bash
# Generate migration files
npm run db:generate

# Apply migrations to the database
npm run db:push

# Optional: View your database with Drizzle Studio
npm run db:studio
```

4. Start the development server:

```bash
npm run dev
```

## API Endpoints

### Authentication

- **POST /api/auth/signup** - Create a new user account
  - Body: `{ "username": "user1", "password": "password123" }`

- **POST /api/auth/login** - Authenticate and get JWT token
  - Body: `{ "username": "user1", "password": "password123" }`
  - Response: `{ "token": "jwt_token", "user": { "id": 1, "username": "user1" } }`

### Messages

- **POST /api/messages/send** - Send a message
  - Headers: `Authorization: Bearer token`
  - Body: `{ "receiverId": 2, "message": "Hello!" }`

- **GET /api/messages/history?receiverId=2** - Get message history with a user
  - Headers: `Authorization: Bearer token`

### User Management

- **POST /api/users/block** - Block a user
  - Headers: `Authorization: Bearer token`
  - Body: `{ "blockedId": 2 }`

- **POST /api/users/unblock** - Unblock a user
  - Headers: `Authorization: Bearer token`
  - Body: `{ "blockedId": 2 }`

- **GET /api/users/blocked** - Get list of blocked users
  - Headers: `Authorization: Bearer token`

## Maintenance

The system automatically deletes messages older than 24 hours. This can be triggered by:

- **POST /api/cron/cleanup-messages** - Delete expired messages
  - Call this endpoint via a CRON job at regular intervals

## Database Schema

- **users** - User accounts
  - id, username, passwordHash, hasSeenDisclaimer

- **messages** - Sent/received messages
  - id, senderId, receiverId, message, timestamp

- **blocked_users** - User blocking relationships
  - blockerId, blockedId

## License

MIT
