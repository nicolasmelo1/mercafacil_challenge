const path = require('path')

const ENV = ![null, undefined, ''].includes(process.env.NODE_ENV) ? process.env.NODE_ENV : 'development'
const DEBUG = true
const PORT = 4000
const SECRET_KEY = 'teste'
const APP_NAME = 'mercafacil_test'

const BASE_PATH = path.dirname(path.resolve(__dirname))

const ROOT_URLCONF = path.join(BASE_PATH , 'src', 'routes')

const INSTALLED_APPS = [
    path.join('src', 'core'),
]

const MIDDLEWARE = [
    require('./core/middlewares').corsMiddleware(),
    require('compression')(),
    require('express').json(),
    require('express').urlencoded({extended: false}),
    require('./core/middlewares').snakeToCamelCaseQueryParams(),
    require('helmet')(),
]

const DATABASE = {   
    varejao: {
        engine: 'postgres',
        databaseName: 'postgres',
        username: 'postgres', 
        password: '',
        host: 'localhost',
        port: 5432,
        extraOptions: {
            logging: false,
            query: { 
                raw: true
            }
        }
    },
    macapa: {
        engine: 'mysql',
        databaseName: 'macapa',
        username: 'admin', 
        password: 'admin',
        host: 'localhost',
        port: 3306,
        extraOptions: {
            logging: false,
            query: { 
                raw: true
            }
        }
    }
}

module.exports = {
    ENV,
    DEBUG,
    PORT,
    BASE_PATH,
    MIDDLEWARE,
    APP_NAME,
    SECRET_KEY,
    ROOT_URLCONF,
    INSTALLED_APPS,
    DATABASE
}