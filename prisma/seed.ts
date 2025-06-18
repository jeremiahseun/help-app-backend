// prisma/seed.ts
import prisma from '../lib/prisma';
import { hashPassword } from '../lib/auth';

async function main() {
    const pw = await hashPassword('YourSecureAdminPass');
    await prisma.user.upsert({
        where: { email: 'admin@help.app' },
        update: {},
        create: { email: 'admin@help.app', password: pw, role: 'ADMIN' },
    });
}
main();
