import express from 'express';
import route from '../../routes/user';

describe('route user', function() {
    it('add routes', function() {
        const app = express();
        route(app);
        expect(app._router.stack.filter(r => r.name === 'bound dispatch').length).toBe(3);
    })
});