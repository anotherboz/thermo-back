import * as Express from 'express';
import { Therm } from '../models/models';
import term from '../routes/term';
import * as Database from '../services/database';

export async function getNodes(req: Express.Request, res: Express.Response) {
  const nodes = await Database.getNodes();
  res.send(JSON.stringify(nodes));
}

export async function add(req: Express.Request, res: Express.Response): Promise<void> {
  if (Number.parseInt(req.headers['content-length'], 10) > 2000) {
      res.statusMessage = 'Payload Too Large';
      res.sendStatus(413);
      return;
    }

  if (req.body.node == null || req.body.value == null) {
    res.sendStatus(400);
    return;
  }

  const therm: Therm = {
    node: req.body.node,
    date: req.body.date ?? new Date(),
    value: req.body.value,  
  }
  
  let nodeId = await Database.getNodeId(therm.node);
  if (!nodeId) {
    nodeId = await Database.addNode(therm.node);
  }
  const tempId = await Database.addTemperature(nodeId, therm.value, therm.date);
  res.sendStatus(200);
}

export async function get(req: Express.Request, res: Express.Response) {
  if (req.params.dateFrom == null || req.params.dateTo == null) {
    res.sendStatus(400);
    return;
  }

  const dateFrom = new Date(req.params.dateFrom);
  const dateTo = new Date(req.params.dateTo);
  const values = await Database.getNodesWithTemperatures(dateFrom, dateTo);
    
  return res.send(values);
}