
export default function dispatchToView(app, View) {

    return async function(req, res) {

        let view = new View(app)

        await view.prepare(req)
        await view.render(res)

    }
    
}
