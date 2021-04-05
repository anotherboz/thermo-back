import * as Database from '../../services/database';
import * as Server from '../../services/server';
import * as fs from 'fs';
import request from 'supertest';

describe('GET /user', function() {
    beforeAll(async function() {
        try {
            const stats = await fs.promises.stat('therm.sqlite');
            await fs.promises.rename('therm.sqlite', 'therm.sqlite.ori');
        } catch {}
    
        await Database.init();
        await Server.run();
    })
    
    afterAll(async function() {
        Server.server.close();
        try {
            const stats = await fs.promises.stat('therm.sqlite.ori');
            await fs.promises.rm('therm.sqlite');
            await fs.promises.rename('therm.sqlite.ori', 'therm.sqlite');
        } catch {}
    });

    it('unauthorized get users', function(done) {
        request(Server.app).get('/users').expect(401, done);
    });

    it('get empty user array', function(done) {
        request(Server.app)
            .get('/users')
            .set('authorization', 'Basic c3VwZXI6c2hpYm91bGV0')
            .expect(200)
            .then(res => {
                expect(res.body).toEqual([]);
                return done();
            })
            .catch(err => done(err));
    });

    it('unauthorized post users', function(done) {
        request(Server.app)
            .post('/user')
            .expect(401, done);
    });

    it('post users', function(done) {
        request(Server.app)
            .post('/user')
            .send({ mail: 'user1@mail', limit: 'red', nodeIds: [1, 2, 3] })
            .set('authorization', 'Basic c3VwZXI6c2hpYm91bGV0')
            .expect(200)
            .then(res => {
                expect(res.body).toEqual(expect.objectContaining({id: 1}));
                request(Server.app)
                .post('/user')
                .send({ mail: 'user2@mail', limit: 'yellow', nodeIds: [4, 5, 6] })
                .set('authorization', 'Basic c3VwZXI6c2hpYm91bGV0')
                .expect(200)
                .then(res => {
                    expect(res.body).toEqual(expect.objectContaining({id: 2}))
                    request(Server.app)
                    .post('/user')
                    .send({ mail: 'user3@mail', limit: 'red', nodeIds: [] })
                    .set('authorization', 'Basic c3VwZXI6c2hpYm91bGV0')
                    .expect(200)
                    .then(res => {
                        expect(res.body).toEqual(expect.objectContaining({id: 3}))
                        return done();
                    });
                })
            })
            .catch(err => done(err));
    });

    it('get users', function(done) {
        request(Server.app)
            .get('/users')
            .set('authorization', 'Basic c3VwZXI6c2hpYm91bGV0')
            .expect(200)
            .then(res => {
                expect(res.body).toEqual(expect.arrayContaining([
                        expect.objectContaining({ id: 1, mail: 'user1@mail', limit: 'red', nodeIds: expect.arrayContaining([1, 2, 3]) }),
                        expect.objectContaining({ id: 2, mail: 'user2@mail', limit: 'yellow', nodeIds: expect.arrayContaining([4, 5, 6]) }),
                        expect.objectContaining({ id: 3, mail: 'user3@mail', limit: 'red', nodeIds: [] }),
                      ]));
                return done();
            })
            .catch(err => done(err));
    });

    it('patch user', function(done) {
        request(Server.app)
            .patch('/user/1')
            .set('authorization', 'Basic c3VwZXI6c2hpYm91bGV0')
            .send({ mail: 'user10@mail', limit: 'yellow', nodeIds: [] })
            .expect(200)
            .then(res => {
                expect(res.body).toEqual(expect.objectContaining({ id: 1 }));
                return done();
            })
            .catch(err => done(err));
    });

    it('check patched user', function(done) {
        request(Server.app)
        .get('/users')
        .set('authorization', 'Basic c3VwZXI6c2hpYm91bGV0')
        .expect(200)
        .then(res => {
            expect(res.body).toEqual(expect.arrayContaining([
                    expect.objectContaining({ id: 1, mail: 'user10@mail', limit: 'yellow', nodeIds: [] }),
                    expect.objectContaining({ id: 2, mail: 'user2@mail', limit: 'yellow', nodeIds: expect.arrayContaining([4, 5, 6]) }),
                    expect.objectContaining({ id: 3, mail: 'user3@mail', limit: 'red', nodeIds: [] }),
                  ]));
            return done();
        })
        .catch(err => done(err));
    });


});