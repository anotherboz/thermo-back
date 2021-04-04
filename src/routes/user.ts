import * as Express from 'express';
import * as UserController from '../controllers/user';

export default function(app: Express.Application) {
  app.route('/users')
    .get(UserController.get);

  app.route('/user/:id')
    .patch(UserController.update);

  app.route('/user')
    .post(UserController.add);
}
