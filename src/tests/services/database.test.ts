import * as Database from '../../services/database';
import * as sqlite3 from 'sqlite3';
import { open } from 'sqlite';  // required for async operations
import * as fs from 'fs';

describe('database service', function() {
    it('init', async function() {
        try {
            const stats = await fs.promises.stat('therm.sqlite');
            await fs.promises.rename('therm.sqlite', 'therm.sqlite.ori');
        } catch {}

        await Database.init();
        Database.close();

        try {
            const db = await open({
                filename: 'therm.sqlite',
                driver: sqlite3.Database
            });
            let result = await db.get('SELECT sql FROM sqlite_master WHERE name like ?', 'node');
            expect(result?.sql).toEqual(expect.anything());
            result = await db.get('SELECT sql FROM sqlite_master WHERE name like ?', 'temperature');
            expect(result?.sql).toEqual(expect.anything());
            result = await db.get('SELECT sql FROM sqlite_master WHERE name like ?', 'user');
            expect(result?.sql).toEqual(expect.anything());
            
              
        } catch (err) {
            fail(err)
        }

            
        
    })

});
