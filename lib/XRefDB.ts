
import request = require('request-promise')

import monitor = require('pg-monitor')

import crypto = require('crypto')
import CerebrumApp from './CerebrumApp';

var pgpOpts = {}
monitor.attach(pgpOpts)
const pgp = require('pg-promise')(pgpOpts)

const prefix = 'http://enrichment.ncl.ac.uk/'



const tables = {
	'DNA': 'dna',
	'RNA': 'rna',
	'Protein': 'protein',
	'SmallMolecule': 'small_molecule',
	'Compound': 'compound',
	'Reaction': 'reaction',
	'ReactionParticipant': 'reaction_participant',
	'Organism': 'organism',
	'Evidence': 'evidence',
	'ProteinProteinInteraction': 'protein_protein_interaction'
}


export default class XRefDB {

	app:CerebrumApp

	db:any

	constructor(app:CerebrumApp) {

		this.app = app

		this.db = pgp({
			host: 'localhost',
			port: 5432,
			database: 'xrefdb',
			user: 'postgres',
			password: 'postgres'
		})

	}

	async getCounts() {
		
		const queries = [];
		for(const a in tables) {
			queries.push({query: 'SELECT count(*) FROM $1:name', values: tables[a]});
		}
		
		const counts = await this.db.multi(pgp.helpers.concat(queries));
		
		return types.map((type, i) => {
			return { type, count: counts[i][0].count };
		});
	}

	private crackQualifiedERI(eri) {

		const [ type, id ] = eri.slice(prefix.length).split('/')

		return { type, id }
	}

	private typeToTable(type) {

		const table = tables[type]

		if(table) {
			return table + ''
		}

		throw new Error('Unknown type: ' + type + '; valid types are: ' + Object.keys(tables).join(', '))
	}

	async getERIForURIs(uris, type) {

		const row = await this.db.oneOrNone('SELECT eri FROM ' + this.typeToTable(type) + ' WHERE uri IN ($1:csv) LIMIT 1', [ uris ])

		if(row) {
			return prefix + type + '/' + row.eri
		}

		return null
	}


	// TODO: race condition between finding that eri does not exist and creating it

	async getOrCreateERIForURIs(uris, type) {

		if(!Array.isArray(uris)) {
			throw new Error('getOrCreateERIForURIs: I expected an array but I got ' + uris)
		}

		var eri = await this.getERIForURIs(uris, type)

		if(eri === null) {

			return prefix + type + '/' + (await this.mintNewERI(uris, type))

		}

		return eri
	}


	async getURIsForERI(eri) {

		const { id, type } = this.crackQualifiedERI(eri)

		const rows = await this.db.manyOrNone('SELECT uri FROM ' + this.typeToTable(type) + ' WHERE eri = $1', [ id  ])

		return rows.map((row) => row.uri)
	}

	private generateID() {
			return crypto.randomBytes(6).toString('hex').toUpperCase()
	}


	async mintNewERI(uris, type) {

		if(!Array.isArray(uris)) {
			throw new Error('mintNewERI: I expected an array but I got ' + uris)
		}

		const allUris = await this.findXRefs(uris, type)

		const eri = this.generateID()

		await this.storeMapping(eri, allUris, type)

		return eri
	}

	async findXRefs(uris, type) {

		// need to call getXRefs on all microservices

		let services = this.app.services

		if(!Array.isArray(uris)) {
			throw new Error('I expected an array but I got ' + uris)
		}

		var oldUris = new Set(uris)
		var newUris = new Set(uris)

		console.log('findXRefs: initial set: ' + JSON.stringify(uris))

		let res = await iterate()

		console.log('findXRefs: done')

		return res

		async function iterate() {

			var n = services.length

			return await new Promise(async (resolve, reject) => {

				console.log('findXRefs: ' + services.length + ' service(s)')

				for(let service of services) {

					console.log('requesting from ' + service.url)

					var body
					
					try {
						body = await request({
							method: 'POST',
							url: service.url + '/getXRefs',
							json: true,
							body: {
								type: type,
								uris: Array.from(newUris)
							}
						})

						console.log(service + ' responded')

						console.log('from service', JSON.stringify(body))

					} catch(e) {

						console.log('findXRefs: ' + service.name + ' error')
						console.dir(e)

						reject(e)

						return
					}

					for(let uri of body.uris) {

						console.log('findXRefs: ' + service.name + ' added: ' + uri)

						newUris.add(uri)
					}

					console.log('left n', n)

					if((-- n) === 0) {

						// all microservices have responded

						console.log('all services have responded, new ' + newUris.size + ' old ' + oldUris.size)

						if(newUris.size === oldUris.size) {

							// nothing new was added; we are done

							resolve(Array.from(newUris))

						} else {
							
							// something new was added; iterate again

							oldUris = new Set(newUris)
							newUris = new Set(newUris)

							iterate().then(resolve).catch(reject)
						}
					}
				}
			
			})
		}


	}

	async storeMapping(eri, uris, type) {

		const cs = new pgp.helpers.ColumnSet(['uri', 'eri'], { table: this.typeToTable(type) });

		const values = uris.map((uri) => {
			return {
				uri: uri,
				eri: eri
			}
		})

		const query = pgp.helpers.insert(values, cs);

		await this.db.none(query)

	}

}




