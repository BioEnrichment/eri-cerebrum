
import { Express, Request, Response } from 'express'
import CerebrumApp from 'lib/CerebrumApp';
import Service from 'lib/Service';
import View from './View';

export default class ServicesView extends View {

    services:Service[]

    constructor(app:CerebrumApp) {
        super(app)
    }

    async prepare(req:Request) {

        await super.prepare(req)

    }

    async render(res:Response) {

        res.render('services', this)

    }

}

