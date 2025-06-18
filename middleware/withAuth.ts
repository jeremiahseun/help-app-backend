import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { verifyToken } from "../lib/auth";

export function withAuth(handler: NextApiHandler) {
    return async (req: NextApiRequest, res: NextApiResponse) => {
        const auth = req.headers.authorization?.split(' ')[1];
        if (!auth) return res.status(401).json({ error: 'Missing token' });
        try {
            const user = verifyToken(auth);
            // attach to req for handlers
            (req as any).user = user;
            return handler(req, res);
        } catch {
            return res.status(401).json({ error: 'Invalid token' });
        }
    };
}
