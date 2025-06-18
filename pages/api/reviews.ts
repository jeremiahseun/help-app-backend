// pages/api/reviews.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';
import { withAuth } from '../../middleware/withAuth';
import { z } from 'zod';

const schema = z.object({
    bookingId: z.number(),
    rating: z.number().min(1).max(5),
    comment: z.string().optional(),
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { userId, role } = (req as any).user;

    if (req.method !== 'POST')
        return res.status(405).json({ status: false, error: `Method ${req.method} Not Allowed` });

    if (role !== 'CLIENT')
        return res.status(403).json({ status: false, error: 'Only clients can leave reviews' });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ status: false, error: parsed.error.format() });

    const { bookingId, rating, comment } = parsed.data;

    // Fetch & verify booking
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { review: true },
    });
    if (!booking) return res.status(404).json({ status: false, error: 'Booking not found' });
    if (booking.clientId !== userId)
        return res.status(403).json({ status: false, error: 'Not your booking' });
    if (booking.review)
        return res.status(400).json({ status: false, error: 'Already reviewed' });
    if (booking.status !== 'ACCEPTED')
        return res
            .status(400)
            .json({ status: false, error: 'Can only review accepted bookings' });

    // Create review & mark booking completed
    const review = await prisma.$transaction([
        prisma.review.create({
            data: { bookingId, rating, comment },
        }),
        prisma.booking.update({
            where: { id: bookingId },
            data: { status: 'COMPLETED' },
        }),
    ]);

    // review[0] is the created Review
    res.status(201).json({ status: true, data: review[0] });
}

export default withAuth(handler);
