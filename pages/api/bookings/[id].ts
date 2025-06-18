// pages/api/bookings/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { withAuth } from '../../../middleware/withAuth';
import { z } from 'zod';

const patchSchema = z.object({
    status: z.enum(['ACCEPTED', 'REJECTED']),
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { userId, role } = (req as any).user;
    const bookingId = Number(req.query.id);

    if (isNaN(bookingId))
        return res.status(400).json({ status: false, error: 'Invalid booking ID' });

    if (req.method !== 'PATCH')
        return res.status(405).json({ status: false, error: `Method ${req.method} Not Allowed` });

    if (role !== 'PROVIDER')
        return res.status(403).json({ status: false, error: 'Only providers can update bookings' });

    const parsed = patchSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ status: false, error: parsed.error.format() });

    // fetch & authorize
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
    });
    if (!booking) return res.status(404).json({ status: false, error: 'Booking not found' });
    if (booking.providerId !== userId)
        return res.status(403).json({ status: false, error: 'Not your booking' });
    if (booking.status !== 'PENDING')
        return res
            .status(400)
            .json({ status: false, error: 'Only pending bookings can be updated' });

    const updated = await prisma.booking.update({
        where: { id: bookingId },
        data: { status: parsed.data.status },
    });
    return res.status(200).json({ status: true, data: updated });
}

export default withAuth(handler);
