import * as Express from 'express';
import * as ThermController from '../controllers/therm';
import * as UserController from '../controllers/user';

export default function(app: Express.Application) {
  app.route('/nodes')
    .get(ThermController.getNodes);

  app.route('/node/:id/config')
    .post(ThermController.setConfig);

  app.route('/therm')
    .post(ThermController.add);

  app.route('/therm/:id/:dateFrom/:dateTo')
    .get(ThermController.getOne);

  app.route('/therms/:dateFrom/:dateTo')
    .get(ThermController.getAll);
}
