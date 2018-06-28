

import { Express, Request, Response } from 'express'
import CerebrumApp from 'lib/CerebrumApp';
import Service from 'lib/Service';

import View from './View'

import ldf = require('ldf-client')
import query from '../query';

export default class QueryView extends View {

    errors:string[]
    result:string|null

    constructor(app:CerebrumApp) {

        super(app)

        this.result = null
        this.errors = []
    }

    async prepare(req:Request) {

        await super.prepare(req)

        if(req.method === 'POST') {
            await this.doQuery(req)
        }


    }

    async render(res:Response) {

        res.render('query', this)
    }


    async doQuery(req:Request) {

        let serviceNames: string[] | undefined = req.body.services

        if(serviceNames === undefined) {
            this.errors.push('Service(s) must be specified')
            return
        }

        let services:Service[] = serviceNames.map((serviceName:string) => {

            const service:Service|undefined = this.app.getServiceByName(serviceName)

            if(service === undefined) {
                throw new Error('service not found: ' + serviceName)
            }

            return service

        })

        let sparql = req.body.sparql

        if(!sparql) {
            this.errors.push('I need a query')
            return
        }

        var result

        try {
            result = await query(services, sparql)
        } catch(e) {
            this.errors.push(e.toString())
        }

        this.result = result
    }
}



