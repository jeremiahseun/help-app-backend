// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

declare global {
    // Prevent multiple instances in dev
    var prisma: PrismaClient | undefined;
}

export default global.prisma ||
    (global.prisma = new PrismaClient({
        log: ['query', 'error', 'warn'],
    }));
