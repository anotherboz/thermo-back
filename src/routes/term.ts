import * as Express from 'express';
import * as ThermController from '../controllers/therm';

export default function(app: Express.Application) {
  app.route('/therm')
    .post(ThermController.add);

  app.route('/therm/:dateFrom/:dateTo')
    .get(ThermController.get);
}
