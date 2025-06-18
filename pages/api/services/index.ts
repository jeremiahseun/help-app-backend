// pages/api/services/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { withAdmin } from '../../../middleware/withAdmin';
import { z } from 'zod';

const createSchema = z.object({ name: z.string().min(1) });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // GET /api/services → public
    if (req.method === 'GET') {
        const services = await prisma.service.findMany({
            orderBy: { name: 'asc' },
        });
        return res.status(200).json({ status: true, services });
    }

    // POST /api/services → Admin only
    if (req.method === 'POST') {
        return withAdmin(async (req, res) => {
            const parsed = createSchema.safeParse(req.body);
            if (!parsed.success)
                return res.status(400).json({ status: false, error: parsed.error.format() });

            const service = await prisma.service.create({
                data: { name: parsed.data.name.trim() },
            });
            return res.status(201).json({ status: true, service });
        })(req, res);
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ status: false, error: `Method ${req.method} Not Allowed` });
}
