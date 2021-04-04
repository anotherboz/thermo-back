import { from } from 'rxjs';
import { map, mergeAll, reduce } from 'rxjs/operators';
import * as sqlite from 'sqlite3';
import { Node, Config, User } from '../models/models';

let db: sqlite.Database;

export function init() {
    if (db != null) {
        return;
    }
    db = new sqlite.Database('therm.sqlite');
    db.run('CREATE TABLE IF NOT EXISTS node (id INTEGER PRIMARY KEY, nom TEXT UNIQUE ON CONFLICT IGNORE, created_at TEXT DEFAULT CURRENT_TIMESTAMP, \
        min INTERGER, max INTERGER, redFrom INTERGER, redTo INTERGER, yellowFrom INTERGER, yellowTo INTERGER, minorTicks INTERGER )')
      .run('CREATE TABLE IF NOT EXISTS temperature (id INTEGER PRIMARY KEY, nodeId NUMBER, value REAL, date TEXT DEFAULT CURRENT_TIMESTAMP)')
      .run('CREATE TABLE IF NOT EXISTS user (id INTERGER PRIMARY KEY, mail TEXT, detectLimit TEXT, nodes TEXT)');

      console.log('database initialized');
}

export function close() {
    db.close();
    this.db = null;
}

export function addNode(node: string): Promise<number> {
    const id$ = new Promise<number>((resolve) =>
    db.run(`INSERT INTO node (nom, min, max, redFrom, redTo, yellowFrom, yellowTo, minorTicks) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                             [node, 0, 60, 35, 60, 25, 35, 5], function(err) {
        if (err) { throw err; }
        resolve(this.lastID);
    }));
    return id$;
}

export function addTemperature(nodeId: number, value: number, date: Date): Promise<number> {
    const id$ = new Promise<number>((resolve) =>
    db.run(`INSERT INTO temperature (nodeId, value, date) VALUES (?,?,?)`, [nodeId, value, date], function(err) {
        if (err) { throw err; }
        resolve(this.lastID);
    }));
    return id$;
}

export function getNodeId(node: string): Promise<number> {
    return new Promise<number>((resolve) => db.get('SELECT id FROM node WHERE nom LIKE ?', [node], function (err, row) {
        if (err) { throw err; } 
        if (row) {
            resolve(row.id);
        } else {
            resolve(undefined);
        }
    }));
}

export function getNode(id: number): Promise<Node> {
    return new Promise<Node>(resolve => {
        db.get('SELECT * FROM node WHERE id = ?', [ id ], (err, row) => {
            if (err) {
                throw err;
            }
            resolve({
                id: row.id,
                nom: row.nom,
                createdAt: row.created_at,
                config: {
                    min: row.min,
                    max: row.max,
                    redFrom: row.redFrom,
                    redTo: row.redTo,
                    yellowFrom: row.yellowFrom,
                    yellowTo: row.yellowTo,
                    minorTicks: row.minorTicks
                },
                temperatures: undefined,
            });
        });
    });
}

export function getNodes(): Promise<Node[]> {
    return new Promise<Node[]>(resolve => {
        db.all('SELECT * FROM node', (err, rows) => {
            if (err) {
                throw err;
            }
            resolve(rows.map(r => ({
                id: r.id,
                nom: r.nom,
                createdAt: r.created_at,
                temperatures: undefined,
                config: {
                    min: r.min,
                    max: r.max,
                    redFrom: r.redFrom,
                    redTo: r.redTo,
                    yellowFrom: r.yellowFrom,
                    yellowTo: r.yellowTo,
                    minorTicks: r.minorTicks
                }
            })));
        });
    });
}

export function getTemperatures(node: Node, dateFrom: Date, dateTo: Date): Promise<Node> {
    return new Promise<Node>(resolve => {
        db.all('SELECT round(date) as date, value FROM temperature WHERE nodeId = ? AND ? <= date AND date < ?', [node.id, dateFrom, dateTo, ], (err , rows) => {
            if (err) { throw err; }

            resolve({
                ...node,
                temperatures: rows.map(r => ({
                    date: new Date(r.date),
                    value: r.value,
                }))
            });
        });
    });
}

export function getNodeWithTemperatures(id: number, dateFrom: Date, dateTo: Date): Promise<Node> {
    return getNode(id).then(node => getTemperatures(node, dateFrom, dateTo));
}

export function getNodesWithTemperatures(dateFrom: Date, dateTo: Date): Promise<Node[]> {
    return getNodes().then(nodes => {
        return from(nodes).pipe(
            map(node => getTemperatures(node, dateFrom, dateTo)),
            mergeAll(),
            reduce((acc, value) => [...acc, value], [])
        ).toPromise()
    });
}

export function updateNodeConfig(id: number, config: Config): Promise<boolean> {
    return new Promise<boolean>(resolve => {
        db.run('UPDATE node SET min = ?, max = ?, redFrom = ?, redTo = ?, yellowFrom = ?, yellowTo = ?, minorTicks = ? WHERE id = ?', 
        [config.min, config.max, config.redFrom, config.redTo, config.yellowFrom, config.yellowTo, config.minorTicks, id],
        (err) => resolve(err == null));
    });
}

export function getUsers(): Promise<User[]> {
    return new Promise<User[]>(resolve => {
        db.all('SELECT id, mail, detectLimit, nodes FROM user', (err, rows) => {
            if (err) {
                throw err;
            }
            return rows.map(row => ({
                id: Number.parseInt(row.id),
                mail: row.mail,
                limit: row.detectLimit,
                nodeIds: (row.nodeIds as string).split(',').map(s => Number.parseInt(s)),
            }));
        })
    });
}

export function getUserId(mail: string): Promise<number> {
    return new Promise<number>(resolve => {
        db.get('SELECT id FROM user WHERE mail = ?', [mail], (err, row) => {
            if (err) {
                throw err;
            }
            return row.id;
        })
    });
}

export function addUser(user: User): Promise<number> {
    return new Promise<number>(resolve => {
        db.run('INSERT INTO user (mail, detectLimit, nodeIds) VALUE (?, ?, ?)', [
            user.id, user.mail, user.limit, user.nodeIds.join(',')
        ], (err) => {
            if (err) {
                throw err;
            }
            resolve(this.lastID);
        });
    });
}

export function updateUser(user: User): Promise<boolean> {
    return new Promise<boolean>(resolve => {
        db.run('UPDATE user SET mail = ?, detectLimit = ? , nodeIds = ? WHERE id = ?', [
            user.mail, user.limit, user.nodeIds.join(','), user.id
        ], (err) => {
            if (err) {
                throw err;
            }
            resolve(this.lastID);
        });
    });
}
