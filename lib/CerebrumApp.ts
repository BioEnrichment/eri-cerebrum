
import { Express, Request, Response } from 'express'
import CerebrumWebApp from './CerebrumWebApp';
import * as fs from 'mz/fs'

import Service from './Service'

import XRefDB from './XRefDB'

import { Logger } from '@bioenrichment/ldf-client'

export default class CerebrumApp {

    webApp:Express

    port:number


    services:Service[]
    pollInterval:number

    xrefs:XRefDB

    config:any



    constructor() {

        Logger.setLevel('debug')

        this.webApp = CerebrumWebApp(this)


    }

    async init():Promise<string> {

        const configFilename:string|undefined = process.env['ENRICHMENT_CONFIG']

        if(configFilename === undefined) {
            throw new Error('The ENRICHMENT_CONFIG environment variable must be set')
        }

        const configJson = await fs.readFileSync(configFilename)
        const config:any = JSON.parse(configJson.toString())

        this.config = config


        this.xrefs = new XRefDB(this)
        await this.xrefs.init()
        

        this.port = config.cerebrum.port

        this.pollInterval = config.cerebrum.pollInterval

        this.services = config.services.map((serviceConfig) => {

            let service = new Service(this)
            service.name = serviceConfig.name
            service.url = serviceConfig.url
            return service

        })

        setInterval(() => this.poll(), this.pollInterval)
        await this.poll()

        return 'ok'
    }

    getServiceByName(serviceName:string):Service|undefined {

        for(let service of this.services) {
            if(service.name === serviceName) {
                return service
            }
        }

        return undefined
        
    }

    async poll():Promise<boolean[]> {

        return await Promise.all(this.services.map((service) => service.poll()))

    }





}
