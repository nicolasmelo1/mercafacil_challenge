const { path } = require('../../../palmares/routers')

const { 
    HealthCheckController,
} = require('./controllers')

const routes = [
    path('/healthcheck', HealthCheckController.asController())
]

module.exports = routes