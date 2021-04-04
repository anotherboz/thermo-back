import * as Express from 'express';
import * as Database from '../services/database';
import { User } from '../models/models';

export async function get(req: Express.Request, res: Express.Response) {
    if (req.headers['authorization'] !== 'Basic c3VwZXI6c2hpYm91bGV0') {
        res.sendStatus(401);
        return;
    }
    const users = await Database.getUsers();
    res.json(users);
}

export async function add(req: Express.Request, res: Express.Response): Promise<void> {
    if (req.headers['authorization'] !== 'Basic c3VwZXI6c2hpYm91bGV0') {
        res.sendStatus(401);
        return;
    }

    if (req.body.node == null || req.body.value == null) {
        res.sendStatus(400);
        return;
    }

    const user: User = {
        id: undefined,
        mail: req.body.mail,
        limit: req.body.limit,
        nodeIds: req.body.nodeIds
    }

    let userId = await Database.getUserId(user.mail);
    if (!userId) {
        userId = await Database.addUser(user);
    }
    res.send({ id: userId });
    res.sendStatus(200);
}

export async function update(req: Express.Request, res: Express.Response): Promise<void> {
    if (req.headers['authorization'] !== 'Basic c3VwZXI6c2hpYm91bGV0') {
        res.sendStatus(401);
        return;
    }

    if (req.body.node == null || req.body.value == null) {
        res.sendStatus(400);
        return;
    }

    const user: User = {
        id: undefined,
        mail: req.body.mail,
        limit: req.body.limit,
        nodeIds: req.body.nodeIds
    }
    
    const userId = await Database.updateUser(user);
    res.sendStatus(200);
}
