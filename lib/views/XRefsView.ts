import CerebrumApp from "../CerebrumApp";
import View from "./View";
import { Request, Response } from "express";

export default class XRefsView extends View {

    counts:any[]

    constructor(app:CerebrumApp) {

        super(app)

    }

    async prepare(req:Request) {

        await super.prepare(req)

        this.counts = await this.app.xrefs.getCounts()

    }

    async render(res:Response) {

        res.render('xrefs', this)
    }

}

