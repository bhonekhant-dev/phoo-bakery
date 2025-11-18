// lib/prisma.js

import { PrismaClient } from '@prisma/client';

// Global scope တွင် Prisma Client ကို သိမ်းဆည်းခြင်း (Hot Reloading ပြဿနာဖြေရှင်းရန်)
const prismaClientSingleton = () => {
  return new PrismaClient();
};

const globalForPrisma = globalThis;

// globalForPrisma.prisma တွင် မရှိသေးမှသာ အသစ်ဖန်တီး၊ ရှိပြီးသားဆို ပြန်သုံး
const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;