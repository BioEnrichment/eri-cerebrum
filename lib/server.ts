
import CerebrumApp from './CerebrumApp'


const app:CerebrumApp = new CerebrumApp()

app.init().then(() => {

    app.webApp.listen(app.port, () => {

        console.log('Cerebrum is running')

    })

})


