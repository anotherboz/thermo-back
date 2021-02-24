import * as Express from 'express';
import { Therm } from '../models/models';
import term from '../routes/term';
import * as Database from '../services/database';

export function add(req: Express.Request, res: Express.Response) {
  console.log('add controller');
    
  
  if (Number.parseInt(req.headers['content-length'], 10) > 2000) {
      res.statusMessage = 'Payload Too Large';
      res.sendStatus(413);
      return;
    }

    if (req.body.node == null || req.body.value) {
      res.sendStatus(400);
      return;
    }

    const therm: Therm = {
      node: req.body.node,
      date: req.body.date ?? new Date(),
      value: req.body.value,  
    }

    Database.addNode(therm.node);
    Database.addTemperature(therm.node, therm.value, therm.date);
}

export function get(req: Express.Request, res: Express.Response) {
  return;
}