# Home-Heist
This is a website

------------------BACKEND README----------------
# Home-Heist

Home-Heist is a web application for searching and comparing home loan products based on user and property information.

## Tech Stack

- **Frontend:** React
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Database Environment:** Docker

## Project Structure

```text
Home-Heist/
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
├── agents/
│   └── db/
│       └── schema.sql
├── docker-compose.yml
└── README.md
```

## Backend Setup

### 1. Clone the repository

```bash
git clone https://github.com/Rolando04/Home-Heist.git
cd Home-Heist
```

Switch to the development branch if needed:

```bash
git switch Agentic-AI
```

### 2. Start PostgreSQL

Make sure Docker Desktop is running.

From the project root:

```bash
docker compose up -d
```

Verify the database container is running:

```bash
docker compose ps
```

The PostgreSQL database is exposed locally on port `5433`.

### 3. Configure the backend environment

Go to the backend:

```bash
cd back-end
```

Create a `.env` file:

```env
DATABASE_URL="postgresql://homeheist:homeheist@localhost:5433/homeheist"
```

Do not commit `.env` to Git.

### 4. Install dependencies

```bash
npm install
```

### 5. Generate the Prisma Client

```bash
npx prisma generate
```

If the database schema has changed, update the Prisma schema from PostgreSQL with:

```bash
npx prisma db pull
npx prisma generate
```

### 6. Start the backend

```bash
npm run dev
```

The API runs at:

```text
http://localhost:3000
```

Test it with:

```bash
curl http://localhost:3000/
```

Expected response:

```json
{
  "message": "Home-Heist API is running"
}
```

## API Endpoints

### Institutions

```text
GET  /api/institutions
GET  /api/institutions/:id
POST /api/institutions
```

### Loan Products

```text
GET  /api/loan-products
GET  /api/loan-products/:id
POST /api/loan-products
```

### Users

```text
GET  /api/users/:id
POST /api/users
```

### Loan Searches

```text
GET  /api/loan-searches
GET  /api/loan-searches/:id
POST /api/loan-searches
```

## Database Models

The current database contains four primary models:

### `product_user`

Stores application users.

### `loan_search`

Stores home-loan searches performed by users.

Each loan search can belong to a `product_user`.

### `institution`

Stores banks, credit unions, lenders, and other financial institutions.

### `loan_product`

Stores mortgage and loan products.

Each loan product can belong to an `institution`.

## Relationships

```text
product_user
     │
     └── loan_search

institution
     │
     └── loan_product
```

## Type Checking

Before committing backend changes, run:

```bash
npx tsc --noEmit
```

No output means the TypeScript type check passed.

## Development Workflow

Before starting work:

```bash
git pull --rebase origin Agentic-AI
```

After making changes:

```bash
npx tsc --noEmit
git status
git add <files>
git commit -m "Describe your changes"
git pull --rebase origin Agentic-AI
git push origin Agentic-AI
```

Avoid force-pushing to the shared development branch.

## Current Backend Status

The backend currently supports:

- Express REST API
- TypeScript
- Prisma ORM
- PostgreSQL running through Docker
- Creating and retrieving institutions
- Creating and retrieving loan products
- Creating and retrieving users
- Creating and retrieving loan searches
- Institution-to-loan-product relationships
- User-to-loan-search relationships

## Planned Backend Work

The current API is intended for development and integration. Remaining work includes:

- Request validation
- Authentication
- Secure password hashing
- Centralized error handling
- Automatic IDs and timestamps
- Loan filtering and matching logic
- Production CORS configuration
- Additional update/delete endpoints as needed

Do not use real passwords or sensitive user information while testing the current development API.


-----------------------------------------------
