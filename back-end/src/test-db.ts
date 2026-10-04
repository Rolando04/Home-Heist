import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const institutions = await prisma.institution.findMany();

  console.log("Database connection successful!");
  console.log("Institutions:", institutions);
}

main()
  .catch((error) => {
    console.error("Database error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
