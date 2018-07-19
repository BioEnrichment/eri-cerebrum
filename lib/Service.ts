
import CerebrumApp from "./CerebrumApp";

import request = require('request-promise')

export default class Service {

    app:CerebrumApp
    name:string
    url:string

    constructor(app:CerebrumApp) {

        this.app = app
    }

    async poll() {


        try {
            await request({
                method: 'GET',
                url: this.url
            })

            console.log('Poll ' + this.name + ': still up')
            return true

        } catch(e) {
            console.log('Poll ' + this.name + ': DOWN')
            return false
        }

    }

}

