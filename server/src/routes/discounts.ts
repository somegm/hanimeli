import { Router } from 'express';

import { DiscountModel } from '../models/Discount';
import { mapExternalId } from '../utils/mappers';
import { sendError } from '../utils/response';

export const discountsRouter = Router();

discountsRouter.get('/', async (_req, res) => {
  const discounts = await DiscountModel.find().sort({ discountPercent: -1 }).lean();
  res.json(discounts.map((discount) => mapExternalId(discount)));
});

discountsRouter.get('/:discountId', async (req, res) => {
  const discount = await DiscountModel.findOne({ externalId: req.params.discountId }).lean();

  if (!discount) {
    sendError(res, 404, 'İndirim bulunamadı');
    return;
  }

  res.json(mapExternalId(discount));
});
