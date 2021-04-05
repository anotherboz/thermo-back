import { json, urlencoded } from 'body-parser';
import therm from '../routes/term';
import user from '../routes/user';
import * as Database from './database';

import express from 'express';
export const app = express();
const port = process.env.PORT || 3000;

app.use(urlencoded({ extended: true }));
app.use(json());
// for CORS 
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  next();
});
// for CORS again
app.route('*').options((req, res) => {
  res.sendStatus(200);
});

export let server;
export const run = (async () => {
  therm(app); // register the route
  user(app);
  // start the Express server
  server = app.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.log('server started on: ' + port);
  });
});
