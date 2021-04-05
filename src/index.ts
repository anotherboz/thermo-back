import * as Server from './services/server';
import * as Database from './services/database';

(async () => {
  await Database.init();
  await Server.run();

  Server.
})();
