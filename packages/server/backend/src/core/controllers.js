const controllers = require('../../../palmares/controllers')
const status = require('../../../palmares/status')

class HealthCheckController extends controllers.Controller {
    /**
     * Retrieves a json if the application is up and running. 
     */

    async get(req, res) { 
        res.status(status.HTTP_200_OK).json({
            status: 'ok'
        })
    }
}

module.exports = {
    HealthCheckController
}