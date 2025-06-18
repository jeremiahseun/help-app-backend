// middleware/withAdmin.ts
import type { NextApiHandler } from 'next';
import { withAuth } from './withAuth';

export const withAdmin = (handler: NextApiHandler) =>
    withAuth((req, res) => {
        const { role } = (req as any).user;
        if (role !== 'ADMIN')
            return res.status(403).json({ error: 'Admin only' });
        return handler(req, res);
    });
