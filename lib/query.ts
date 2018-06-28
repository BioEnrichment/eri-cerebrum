
import Service from './Service'

import ldf = require('ldf-client')

export default async function query(services:Service[], sparql:string):Promise<any> {

    let fragmentsClient = new ldf.FragmentsClient(services.map((service) => service.url + '/query'))

    const results = new ldf.SparqlIterator(sparql, { fragmentsClient: fragmentsClient });

    return await new Promise<any>((resolve, reject) => {
        results.on('data', (result) => {
            resolve(result)
        })
    })

}