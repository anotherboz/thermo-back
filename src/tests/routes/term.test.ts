import express from 'express';
import route from '../../routes/term';

describe('route term', function() {
    it('add routes', function() {
        const app = express();
        app.use(route);
        expect(app._router.stack.filter(r => r.name === 'bound dispatch').length).toBe(5);
    })
});