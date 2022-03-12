import * as Express from 'express';
import * as UserController from '../controllers/user';

var router = Express.Router();

router.route('/users')
  .get(UserController.get);

router.route('/user/:id')
  .patch(UserController.update);

router.route('/user')
  .post(UserController.add);

export default router;
