
import * as express from 'express'
import * as bodyParser from 'body-parser'
import { Express, Request, Response } from 'express'
import * as less from 'less'
import * as fs from 'fs'
import CerebrumApp from 'lib/CerebrumApp';

import ServicesView from './views/ServicesView';
import QueryView from './views/QueryView';
import XRefsView from './views/XRefsView';
import dispatchToView from './views/dispatchToView';

export default function CerebrumWebApp(crApp:CerebrumApp) {

    let webApp:Express = express()

    webApp.use(bodyParser.urlencoded({}))
    webApp.use(bodyParser.json({}))

    webApp.set('view engine', 'ejs')
    webApp.set('views', 'templates')

    webApp.get('/', (req:Request, res:Response) => {
        res.redirect('/services')
    })

    webApp.all('/services', dispatchToView(crApp, ServicesView))
    webApp.all('/query', dispatchToView(crApp, QueryView))
    webApp.all('/xrefs', dispatchToView(crApp, XRefsView))

    webApp.get('/styles.css', (req:Request, res:Response) => {

        const lessOpts = {
            paths: ['less'],
            filename: 'cerebrum.less'
        }

        less.render(fs.readFileSync('./less/cerebrum.less').toString(), lessOpts).then((output) => {
            res.header('content-type', 'text/css')
            res.send(output.css)

        })

    
    })

    webApp.use(express.static('public'))



    webApp.post('/eri2uris', async (req, res) => {

        // have eri, want uris

        const eri = req.body.eri

        let uris = await crApp.xrefs.getURIsForERI(eri)

        res.send(JSON.stringify({
            uris: uris
        }))
    })

    webApp.post('/uris2eri', async (req, res) => {

        // have uri(s), want eri

        const uris = req.body.uris
        const type = req.body.type

        let eri = await crApp.xrefs.getOrCreateERIForURIs(uris, type)

        res.send(JSON.stringify({
            eri: eri
        }))
    })


    return webApp
}


