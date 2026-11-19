import { randomUUID } from 'crypto';
import { Router } from 'express';

import { UserModel } from '../models/User';
import { hashPassword, verifyPassword } from '../utils/password';
import { sendError } from '../utils/response';
import { signAccessToken } from '../utils/jwt';
import {
  sanitizeDisplayName,
  sanitizeEmail,
  sanitizeLoginPassword,
  validateSignupPassword,
} from '../utils/validation';

export const authRouter = Router();

function toAuthResponse(user: { externalId: string; displayName: string; email?: string | null }) {
  return {
    token: signAccessToken(user.externalId),
    user: {
      id: user.externalId,
      displayName: user.displayName,
      email: user.email ?? null,
    },
  };
}

authRouter.post('/register', async (req, res) => {
  const email = sanitizeEmail(req.body?.email);
  const rawPassword = typeof req.body?.password === 'string' ? req.body.password : null;
  const displayName = sanitizeDisplayName(req.body?.displayName);

  if (!email || !rawPassword || !displayName) {
    sendError(
      res,
      400,
      'Geçerli e-posta, ad soyad (2-50 karakter) ve şifre bilgilerini girin.',
    );
    return;
  }

  const passwordError = validateSignupPassword(rawPassword);
  if (passwordError) {
    sendError(res, 400, passwordError);
    return;
  }

  const existing = await UserModel.findOne({ email }).lean();
  if (existing) {
    sendError(res, 409, 'Bu e-posta adresi zaten kayıtlı.');
    return;
  }

  const passwordHash = await hashPassword(rawPassword);
  const user = await UserModel.create({
    externalId: randomUUID(),
    displayName,
    email,
    passwordHash,
  });

  res.status(201).json(toAuthResponse(user));
});

authRouter.post('/login', async (req, res) => {
  const email = sanitizeEmail(req.body?.email);
  const password = sanitizeLoginPassword(req.body?.password);

  if (!email || !password) {
    sendError(res, 400, 'Geçerli e-posta ve şifre girin.');
    return;
  }

  const user = await UserModel.findOne({ email });
  if (!user?.passwordHash) {
    sendError(res, 401, 'E-posta veya şifre hatalı.');
    return;
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    sendError(res, 401, 'E-posta veya şifre hatalı.');
    return;
  }

  res.json(toAuthResponse(user));
});
