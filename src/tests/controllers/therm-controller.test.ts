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
        // try {
        //     const stats = await fs.promises.stat('therm.sqlite.ori');
        //     await fs.promises.rm('therm.sqlite');
        //     await fs.promises.rename('therm.sqlite.ori', 'therm.sqlite');
        // } catch {}
    });

    it('get empty nodes', function(done) {
        request(Server.app).get('/nodes').expect(200, [], done);
    });

    it('post therm', function(done) {
        request(Server.app).post('/therm').send({ node: 'node1', value: 20 })
            .expect(200, done);
        
        request(Server.app).post('/therm').send({ node: 'node1', value: 'deux cents'})
            .expect(400, done);
        
        request(Server.app).post('/therm').send({ node: 'node1'})
            .expect(400, done);
        
        request(Server.app).post('/therm').send({ nodus: 'node1', value: 12 })
            .expect(400, done);

        request(Server.app).post('/therm').send({ node: 'node1', value: 21.3, date: new Date('2021-03-01T12:34:56Z') })
            .expect(200, done);
    });

    it('get some nodes', function(done) {
        request(Server.app).get('/nodes').expect(200).then(res => {
            expect(res.body).toEqual(expect.arrayContaining([
                expect.objectContaining({ 
                    id: 1,    
                    nom: 'node1',
                    createdAt: expect.any(String),
                    config: expect.objectContaining({
                        min: 0,
                        max: 60,
                        redFrom: 35,
                        redTo: 60,
                        yellowFrom: 25,
                        yellowTo: 35,
                        minorTicks: 5
                    }),
                })
            ]));
        });

        request(Server.app).post('/therm').send({ node: 'node2', value: 20, date: new Date('2021-03-01 12:34:57') })
            .expect(200).then(function(res) {
                request(Server.app).get('/nodes').expect(200).then(res => {
                    expect(res.body).toEqual(expect.arrayContaining([
                        expect.objectContaining({ 
                            id: 1,    
                            nom: 'node1',
                        }),
                        expect.objectContaining({ 
                            id: 2,    
                            nom: 'node2',
                        })
                    ]));
                    return done();
                });
            });
    });

    it('get values for one node', function(done) {
        request(Server.app).get('/therm/1/2020-03-01T12:00:00/2023-03-01T13:00:00')
            .expect(200)
            .then(res => {
                console.log(res.body);
                expect(res.body).toEqual(
                    expect.objectContaining({ 
                        id: 1,    
                        nom: 'node1',
                        config: {
                            min: 0,
                            max: 60,
                            redFrom: 35,
                            redTo: 60,
                            yellowFrom: 25,
                            yellowTo: 35,
                            minorTicks: 5
                          },
                          temperatures: []
                    }),
                );
                done();
            });
    });
});