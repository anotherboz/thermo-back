import * as Express from 'express';
import * as ThermController from '../controllers/therm';

var router = Express.Router();

router.route('/nodes')
  .get(ThermController.getNodes);

router.route('/node/:id/config')
  .post(ThermController.setConfig);

router.route('/therm')
  .post(ThermController.add);

router.route('/therm/:id/:dateFrom/:dateTo')
  .get(ThermController.getOne);

router.route('/therms/:dateFrom/:dateTo')
  .get(ThermController.getAll);

export default router;