// pages/api/auth/login.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { comparePassword, signToken } from '../../../lib/auth';
import { z } from 'zod';

const schema = z.object({
    email: z.string().email(),
    password: z.string(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST')
        return res.status(405).json({ status: false, error: 'Method not allowed' });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ status: false, error: parsed.error.format() });

    //* Check if user exists
    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ status: false, error: 'Invalid credentials' });

    const valid = await comparePassword(password, user.password);
    if (!valid) return res.status(401).json({ status: false, error: 'Invalid credentials' });

    const token = signToken({ userId: user.id, role: user.role });
    res.json({ status: true, token });
}
