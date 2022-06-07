const { path } = require('../../palmares/routers')

const routes = [
    path('/core', require('./core/routes')),
]

module.exports = routes