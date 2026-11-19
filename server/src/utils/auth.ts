import type { Request } from 'express';

import type { AuthedRequest } from '../middleware/userId';

export function getUserId(req: Request): string {
  return (req as unknown as AuthedRequest).userId;
}
