// pages/api/auth/me.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { withAuth } from '../../../middleware/withAuth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { userId } = (req as any).user;
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, role: true, createdAt: true },
    });
    res.json({ status: true, user: user });
}

export default withAuth(handler);
