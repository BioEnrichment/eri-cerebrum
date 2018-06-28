
import { Request, Response } from 'express'
import Menu, { MenuItem } from './Menu';
import CerebrumApp from '../CerebrumApp';

export default abstract class View {

    app:CerebrumApp
    title:string
    menu:Menu

    constructor(app:CerebrumApp) {

        this.app = app

        this.menu = new Menu()

        this.title = 'Untitled View'
    }

    async prepare(req:Request) {
        this.menu.addItem(new MenuItem('Services', '/services', 'fa-share-alt'))
        this.menu.addItem(new MenuItem('Query', '/query', 'fa-share-alt'))
        this.menu.addItem(new MenuItem('XRefs', '/xrefs', 'fa-share-alt'))
    }

    abstract async render(res:Response)

}