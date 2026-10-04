# Home-Heist

Home-Heist is a web application for searching, discovering, and comparing home-loan products based on borrower and property information.

The project combines a React frontend, a Node.js/Express backend, PostgreSQL, and an agent-based loan discovery system.

## Tech Stack

- **Frontend:** React, TypeScript
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Database Environment:** Docker
- **Password Hashing:** bcrypt
- **Agent System:** TypeScript, Gemini, MCP, HMDA data

## Project Structure

```text
Home-Heist/
├── front-end/
│   └── React application
│
├── back-end/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── controllers/
│   │   ├── lib/
│   │   │   └── prisma.ts
│   │   ├── routes/
│   │   └── server.ts
│   ├── package.json
│   ├── prisma7.config.ts
│   └── tsconfig.json
│
├── agents/
│   ├── db/
│   │   ├── schema.sql
│   │   └── seed.sql
│   └── src/
│
├── docker-compose.yml
└── README.md
```

## Backend Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Rolando04/Home-Heist.git
cd Home-Heist
```

The primary integrated branch is:

```bash
git switch main
```

Before beginning work, update your local branch:

```bash
git pull --rebase origin main
```

### 2. Start PostgreSQL

Make sure Docker Desktop is running.

From the project root:

```bash
docker compose up -d
```

Verify the database container:

```bash
docker compose ps
```

PostgreSQL is exposed locally on port `5433`.

The development database uses:

```text
Database: homeheist
User:     homeheist
Port:     5433
```

### 3. Configure the Backend Environment

Enter the backend directory:

```bash
cd back-end
```

Create a local `.env` file containing:

```env
DATABASE_URL="postgresql://homeheist:homeheist@localhost:5433/homeheist"
```

Environment files containing secrets or local configuration should not be committed to Git.

### 4. Install Dependencies

```bash
npm install
```

### 5. Generate the Prisma Client

```bash
npx prisma generate
```

If the PostgreSQL schema has changed, synchronize Prisma with the database:

```bash
npx prisma db pull
npx prisma generate
```

### 6. Type Check

Before running or committing backend changes:

```bash
npx tsc --noEmit
```

No output means the TypeScript check passed.

### 7. Start the Backend

```bash
npm run dev
```

The backend API runs on:

```text
http://localhost:3000
```

Test the server:

```bash
curl http://localhost:3000/
```

Expected response:

```json
{
  "message": "Home-Heist API is running"
}
```

---

# API Endpoints

## Institutions

```text
GET  /api/institutions
GET  /api/institutions/:id
POST /api/institutions
```

Institutions represent banks, credit unions, lenders, and other organizations that provide mortgage products.

## Loan Products

```text
GET  /api/loan-products
GET  /api/loan-products/:id
POST /api/loan-products
```

Loan products can be associated with an institution.

## Users

```text
GET  /api/users/:id
POST /api/users
POST /api/users/login
```

### Register a User

`POST /api/users`

Example:

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user-001",
    "email": "user@example.com",
    "password": "ExamplePassword123!"
  }'
```

The client sends a plaintext password over the API request. The backend hashes the password with bcrypt before storing it.

The plaintext password is never stored in PostgreSQL.

A successful response does not expose the password hash.

Example:

```json
{
  "user_id": "user-001",
  "email": "user@example.com",
  "creation_time": null,
  "creation_date": null
}
```

Passwords must currently contain at least 8 characters.

### Unique Emails

User email addresses are unique.

Attempting to create another account with an existing email returns:

```text
409 Conflict
```

Example:

```json
{
  "error": "An account with this email already exists"
}
```

The unique-email requirement is enforced by PostgreSQL and represented in the Prisma schema.

### User Login

`POST /api/users/login`

Example:

```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "ExamplePassword123!"
  }'
```

The backend retrieves the stored bcrypt hash and verifies the supplied password using bcrypt password comparison.

A successful login returns:

```text
200 OK
```

Example:

```json
{
  "message": "Login successful",
  "user": {
    "user_id": "user-001",
    "email": "user@example.com",
    "creation_time": null,
    "creation_date": null
  }
}
```

An incorrect password returns:

```text
401 Unauthorized
```

A nonexistent email also returns:

```text
401 Unauthorized
```

Both cases intentionally return the same response:

```json
{
  "error": "Invalid email or password"
}
```

This prevents the login API from revealing whether a particular email address has an account.

### Password Security

Passwords are hashed with bcrypt using a cost factor of 12.

Stored hashes resemble:

```text
$2b$12$...
```

The backend must never:

- Store plaintext passwords
- Return password hashes through API responses
- Log plaintext passwords
- Attempt to decrypt password hashes

Password verification should always use bcrypt comparison.

## Loan Searches

```text
GET  /api/loan-searches
GET  /api/loan-searches/:id
POST /api/loan-searches
```

Loan searches contain borrower and property information used during the loan-search process.

---

# Database Models

The PostgreSQL database currently contains four primary models.

## `product_user`

Stores application users.

Important fields include:

```text
user_id
email
passwordhash
creation_time
creation_date
```

Email addresses are unique.

Passwords are stored only as bcrypt hashes.

## `loan_search`

Stores home-loan searches performed by users.

A loan search can belong to a `product_user`.

Example information includes:

```text
income
credit score
property ZIP
property price
down payment
loan amount
```

## `institution`

Stores banks, credit unions, lenders, and other financial institutions.

## `loan_product`

Stores mortgage and loan products.

A loan product can belong to an `institution`.

## Database Relationships

```text
product_user
     │
     │ 1
     │
     └────────< loan_search
                 many


institution
     │
     │ 1
     │
     └────────< loan_product
                 many
```

These relationships are enforced using PostgreSQL foreign keys and represented by Prisma relations.

---

# Agent Service

Home-Heist also contains an agent service under:

```text
agents/
```

The agent system is responsible for discovering and comparing mortgage lenders and loan products.

Its high-level pipeline is:

```text
Borrower Profile
      │
      ▼
ZIP → County FIPS
      │
      ▼
HMDA Lender Discovery
      │
      ▼
Institution Agent
      │
      ▼
Loan Agent
      │
      ▼
PostgreSQL
      │
      ▼
Recommendation
```

The agent HTTP service runs separately from the primary backend.

```text
Backend API:  http://localhost:3000
Agent API:    http://localhost:3001
PostgreSQL:   localhost:5433
```

See `agents/README.md` for agent-specific setup and API documentation.

---

# Development Workflow

Before starting work:

```bash
git switch main
git pull --rebase origin main
```

After making backend changes:

```bash
npx tsc --noEmit
git status
```

Stage only the files related to the change:

```bash
git add <files>
```

Commit:

```bash
git commit -m "Describe your changes"
```

Before pushing shared work, make sure the remote branch has not moved:

```bash
git fetch origin
git rebase origin/main
```

Then push:

```bash
git push origin main
```

Do not force-push shared `main` unless the team has explicitly agreed to it.

---

# Current Backend Status

The backend currently supports:

- Express REST API
- TypeScript
- Prisma ORM
- PostgreSQL through Docker
- Institution creation and retrieval
- Loan-product creation and retrieval
- User creation and retrieval
- Loan-search creation and retrieval
- Institution-to-loan-product relationships
- User-to-loan-search relationships
- bcrypt password hashing
- Minimum password-length validation
- Unique user email addresses
- Duplicate-email handling
- Email/password login
- bcrypt password verification
- Password-hash filtering from user API responses
- Generic authentication failure responses to reduce account enumeration

# Planned Backend Work

Remaining backend work may include:

- Persistent authentication using sessions or tokens
- Protected/authenticated API routes
- More comprehensive request validation
- Centralized error handling
- Automatic user/search IDs
- Automatic timestamps
- Loan filtering and matching logic
- Production CORS configuration
- Additional update/delete endpoints
- Automated API tests
- Production security configuration

The current login endpoint verifies credentials but does **not yet establish a persistent authenticated session**. Successful login should not currently be interpreted as authorization for protected resources.

Do not use real passwords, financial information, or other sensitive personal information while testing the development environment.
