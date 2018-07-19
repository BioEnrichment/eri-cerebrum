
import Service from './Service'

import ldf = require('ldf-client')

export default async function query(services:Service[], sparql:string):Promise<any> {

    console.log('Services ' + services)

    let fragmentsClient = new ldf.FragmentsClient(services.map((service) => service.url))

    const results = new ldf.SparqlIterator(sparql, { fragmentsClient: fragmentsClient });

    return await new Promise<any>((resolve, reject) => {
        let r:any[] = []
        results.on('data', (result) => {
            r.push(result)
        })
        results.on('end', () => {
            resolve(r)
        })
        results.on('error', (err) => {
            reject(err)
        })
    })

}
