import { PrismaClient } from '@prisma/client';

if (process.env.DATABASE_URL) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace(/\r/g, '').trim();
}

const prisma = new PrismaClient();

export default prisma;
