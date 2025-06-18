// pages/api/bookings/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { withAuth } from '../../../middleware/withAuth';
import { z } from 'zod';

const createSchema = z.object({
    providerId: z.number(),
    serviceId: z.number(),
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { userId, role } = (req as any).user;

    // POST /api/bookings → client books a provider
    if (req.method === 'POST') {
        if (role !== 'CLIENT')
            return res.status(403).json({ status: false, error: 'Only clients can book services' });

        const parsed = createSchema.safeParse(req.body);
        if (!parsed.success)
            return res.status(400).json({ status: false, error: parsed.error.format() });

        // ensure provider exists and is a provider
        const provider = await prisma.user.findUnique({
            where: { id: parsed.data.providerId },
        });
        if (!provider || provider.role !== 'PROVIDER')
            return res.status(404).json({ status: false, error: 'Provider not found' });

        // ensure service exists
        const service = await prisma.service.findUnique({
            where: { id: parsed.data.serviceId },
        });
        if (!service)
            return res.status(404).json({ status: false, error: 'Service not found' });

        // ensure service is offered by provider
        if (service.providerId !== parsed.data.providerId)
            return res.status(400).json({ status: false, error: 'Service not offered by provider' });

        const booking = await prisma.booking.create({
            data: {
                clientId: userId,
                providerId: parsed.data.providerId,
                serviceId: parsed.data.serviceId,
            },
        });
        return res.status(201).json({ status: true, booking });
    }

    // GET /api/bookings → bookings for the logged-in user
    if (req.method === 'GET') {
        const where =
            role === 'CLIENT'
                ? { clientId: userId }
                : { providerId: userId };

        const bookings = await prisma.booking.findMany({
            where,
            orderBy: { requestedAt: 'desc' },
            include: {
                client: { select: { id: true, email: true } },
                provider: { select: { id: true, email: true } },
                service: true,
                review: true,
            },
        });
        return res.status(200).json({ status: true, bookings });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ status: false, error: `Method ${req.method} Not Allowed` });
}

export default withAuth(handler);
