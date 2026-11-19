import type { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'crypto';

import { UserModel } from '../models/User';
import { verifyAccessToken } from '../utils/jwt';

export interface AuthedRequest extends Request {
  userId: string;
}

async function resolveGuestUserId(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const headerValue = req.header('X-User-Id')?.trim();

  if (!headerValue) {
    res.status(401).json({ error: 'Kimlik doğrulama gerekli' });
    return;
  }

  let user = await UserModel.findOne({ externalId: headerValue }).lean();

  if (!user) {
    user = await UserModel.create({
      externalId: headerValue,
      displayName: 'Misafir',
    });
  }

  (req as AuthedRequest).userId = user.externalId;
  next();
}

export async function resolveUserId(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.header('Authorization')?.trim();

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    if (!token) {
      res.status(401).json({ error: 'Geçersiz oturum' });
      return;
    }

    try {
      const payload = verifyAccessToken(token);
      const user = await UserModel.findOne({ externalId: payload.userId }).lean();
      if (!user) {
        res.status(401).json({ error: 'Kullanıcı bulunamadı' });
        return;
      }
      (req as AuthedRequest).userId = user.externalId;
      next();
      return;
    } catch {
      res.status(401).json({ error: 'Oturum süresi doldu veya geçersiz' });
      return;
    }
  }

  await resolveGuestUserId(req, res, next);
}

export function createGuestUserId(): string {
  return randomUUID();
}
