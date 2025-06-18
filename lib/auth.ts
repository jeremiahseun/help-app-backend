import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const SECRET = process.env.JWT_SECRET!;

export function hashPassword(pw: string) {
    return bcrypt.hash(pw, 10);
}

export function comparePassword(pw: string, hash: string) {
    return bcrypt.compare(pw, hash);
}

export function signToken(payload: { userId: number; role: string }) {
    return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string) {
    return jwt.verify(token, SECRET) as { userId: number; role: string };
}
