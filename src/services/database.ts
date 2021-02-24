import * as FS from 'fs';
import { from, Observable } from 'rxjs';
import { concatAll, map, mergeAll, reduce, switchMap } from 'rxjs/operators';
import * as sqlite from 'sqlite3';
import { Temperature, Node } from '../models/models';

let db: sqlite.Database;

export function init() {
    if (db != null) {
        return;
    }
    db = new sqlite.Database('therm.sqlite');
    db.run('CREATE TABLE IF NOT EXISTS node (id INTEGER PRIMARY KEY AUTOINCREMENT, nom TEXT UNIQUE ON CONFLICT IGNORE, created_at TEXT DEFAULT CURRENT_TIMESTAMP)')
      .run('CREATE TABLE IF NOT EXISTS temperature (id INTEGER PRIMARY KEY AUTOINCREMENT, nodeId NUMBER, value REAL, created_at TEXT DEFAULT CURRENT_TIMESTAMP)');
    console.log('database initialized');
}

export function addNode(node: string): Observable<number> {
    const id$ = new Observable<number>((subscriber) =>
    db.run(`INSERT INTO node (nom) VALUES (?)`, [node], (err) => {
          if (err) {
              throw err;
          }
          subscriber.next(this.lastID);
       }));
    return id$;
}

export function addTemperature(node: string, value: number, date: Date): Observable<number> {
    const id$ = new Observable<number>((subscriber) =>
    db.run(`INSERT INTO temperature (nodeId, value, date) SELECT nodeId, ?:2; ?:3 FROM node WHERE nom LIKE ?:1`, [node, value, date], (err) => {
          if (err) {
              throw err;
          }
          subscriber.next(this.lastID);
       }));
    return id$;
}

export function getNodes(): Observable<Node[]> {
    return new Observable<Node[]>(subscriber => {
        db.all('SELECT * FROM node', (err, rows) => {
            if (err) {
                throw err;
            }
            subscriber.next(rows.map(r => ({
                id: r.id,
                nom: r.nom,
                createdAt: r.created_at,
            })));
        });
    });
}

export function getTemperatures(node: Node, dateFrom: Date, dateTo: Date): Observable<Node> {
    return new Observable<Node>(subscriber => {
        db.all('SELECT * FROM temperature WHERE nodeId = ? AND ? <= date AND date < ?', [node.id, dateFrom, dateTo, ], (err , rows) => {
            if (err) {
                throw err;
            }
            subscriber.next({
                ...node,
                temperatures: rows.map(r => ({
                    date: r.date,
                    value: r.value,
                }))
            });
        });
    });
}


export function getNodesWithTemperatures(dateFrom: Date, dateTo: Date): Observable<Node[]> {
    return getNodes().pipe(
        switchMap(nodes => from(nodes)),
        map(node => getTemperatures(node, dateFrom, dateTo)),
        mergeAll(),
        reduce((acc, value) => [...acc, value], [])
    );
}
