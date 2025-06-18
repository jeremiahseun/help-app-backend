import { NextApiRequest, NextApiResponse } from "next";
import { hashPassword } from "../../../lib/auth";
import prisma from "../../../lib/prisma";
import { z } from "zod";

const SignupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(["CLIENT", "PROVIDER"])
});

export default async function signup(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).json({ status: false, error: 'Method not allowed' });
    //* Parse the body
    const result = SignupSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ status: false, error: result.error.errors });

    //* Create the user
    const { email, password, role } = result.data;
    const hash = await hashPassword(password);
    const user = await prisma.user.create({ data: { email, password: hash, role } });
    res.status(201).json({ status: true, id: user.id, email: user.email, role: user.role });
}
