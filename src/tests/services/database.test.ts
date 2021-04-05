import * as Database from '../../services/database';
import * as sqlite3 from 'sqlite3';
import { open } from 'sqlite';  // required for async operations
import * as fs from 'fs';
import { delay } from 'rxjs/operators';

describe('database service', function() {
    beforeAll(async () => {
        try {
            const stats = await fs.promises.stat('therm.sqlite');
            await fs.promises.rename('therm.sqlite', 'therm.sqlite.ori');
        } catch {}
    });
    
    afterAll(async () => {
        try {
            const stats = await fs.promises.stat('therm.sqlite.ori');
            // await fs.promises.rm('therm.sqlite');
            // await fs.promises.rename('therm.sqlite.ori', 'therm.sqlite');
        } catch {}
    });

    
    it('init', async function() {
        await Database.init();
        await Database.close();

        const db = await open({
            filename: 'therm.sqlite',
            driver: sqlite3.Database
        });
        try {
            let result = await db.get('SELECT sql FROM sqlite_master WHERE name like ?', 'node');
            expect(result?.sql).toEqual(expect.anything());
            result = await db.get('SELECT sql FROM sqlite_master WHERE name like ?', 'temperature');
            expect(result?.sql).toEqual(expect.anything());
            result = await db.get('SELECT sql FROM sqlite_master WHERE name like ?', 'user');
            expect(result?.sql).toEqual(expect.anything());
        } catch (err) {
            fail(err)
        } finally {
            db.close();
        }
    });


    it('add/select/delete node', async function() {
        await Database.init();
        await Database.removeAllNodes();
        let id = await Database.addNode('test');
        await Database.close();

        try {
            const db = await open({ filename: 'therm.sqlite', driver: sqlite3.Database });
            let rows = await db.all('SELECT * FROM node');

            expect(rows.length).toBe(1);
            let row = rows[0];
            expect(id).toEqual(expect.any(Number));
            expect(row).toMatchObject({
                id: expect.any(Number),
                created_at: expect.any(String),
                nom: 'test',
                min: 0,
                max: 60,
                redFrom: 35,
                redTo: 60,
                yellowFrom: 25,
                yellowTo: 35,
                minorTicks: 5,
            });
            await db.close();
        } catch (err) {
            fail(err)
        }

        await Database.init();
        let node = await Database.getNode(id);
        expect({id, nom: 'test', temperature: undefined}).toEqual(expect.objectContaining({id, nom: 'test', temperature: undefined}));

        await Database.removeNode(id)
        await Database.close();
        const db = await open({ filename: 'therm.sqlite', driver: sqlite3.Database });
        let rows = await db.all('SELECT * FROM node');
        expect(rows.length).toBe(0);
        await db.close();
    });


    it('add/select/delete temperature', async function() {
        await Database.init();
        let nodes = await Database.getNodes();
        nodes.forEach(async n => {
            await Database.removeAllTemperature(n.id);
            await Database.removeNode(n.id)
        });
        
        let id1 = await Database.addNode('test1');
        Database.addTemperature(id1, 12, new Date('2021-04-05 12:34:56'));
        Database.addTemperature(id1, 12, new Date('2021-04-05 12:34:57'));

        let id2 = await Database.addNode('test2');
        Database.addTemperature(id2, 13, new Date('2021-04-05 12:34:56'));
        Database.addTemperature(id2, 13, new Date('2021-04-05 12:34:57'));
        Database.addTemperature(id2, 13, new Date('2021-04-10 12:34:57'));

        nodes = await Database.getNodesWithTemperatures(new Date('2021-04-05 00:00:00'), new Date('2021-04-05 23:59:59'))

        await Database.close();

        try {
            expect(nodes).toEqual(expect.arrayContaining([
                expect.objectContaining({
                    id: 1,
                    nom: 'test1',
                    temperatures:  expect.arrayContaining([
                        expect.objectContaining({
                            value: 12, date: new Date('2021-04-05 12:34:56')
                        }),
                        expect.objectContaining({
                            value: 12, date: new Date('2021-04-05 12:34:57')
                        })
                    ]),
                }),
                expect.objectContaining({
                    id: 2,
                    nom: 'test2',
                    temperatures:  expect.arrayContaining([
                        expect.objectContaining({
                            value: 13, date: new Date('2021-04-05 12:34:56')
                        }),
                        expect.objectContaining({
                            value: 13, date: new Date('2021-04-05 12:34:57')
                        })
                    ]),
                })
            ]));            

            const db = await open({ filename: 'therm.sqlite', driver: sqlite3.Database });
            let rows = await db.all('SELECT * FROM node');
            expect(rows.length).toBe(2);
            expect(rows[0]).toMatchObject({nom: 'test1'});
            rows = await db.all('SELECT * FROM temperature');
            expect(rows.length).toBe(5);
            expect(rows[0]).toMatchObject({value: 12});
            
            db.close();
        } catch(err) {
            fail(err);
        }
    });
});
