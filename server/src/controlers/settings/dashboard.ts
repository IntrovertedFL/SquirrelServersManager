import express from 'express';
import Authentication from '../../middlewares/Authentication';
import keys from '../../redis/defaults/keys';
import logger from '../../logger';
import { setToCache } from '../../redis';

const router = express.Router();

router.post(`/dashboard/:key`, Authentication.isAuthenticated, async (req, res) => {
  if (!req.params.key) {
    res.status(404).send({
      success: false,
    });
    return;
  }
  if (isNaN(req.body.value)) {
    res.status(401).send({
      success: false,
    });
    return;
  }
  try {
    switch (req.params.key) {
      case keys.GeneralSettingsKeys.CONSIDER_PERFORMANCE_GOOD_CPU_IF_LOWER:
        await setToCache(
          keys.GeneralSettingsKeys.CONSIDER_PERFORMANCE_GOOD_CPU_IF_LOWER,
          req.body.value,
        );
        return res.send({ success: true });
      case keys.GeneralSettingsKeys.CONSIDER_PERFORMANCE_GOOD_MEM_IF_GREATER:
        await setToCache(
          keys.GeneralSettingsKeys.CONSIDER_PERFORMANCE_GOOD_MEM_IF_GREATER,
          req.body.value,
        );
        return res.send({ success: true });
      default:
        return res.status(404).send({
          success: false,
        });
    }
  } catch (error) {
    logger.error(error);
    res.status(500).send({
      success: false,
    });
    return;
  }
});

export default router;
