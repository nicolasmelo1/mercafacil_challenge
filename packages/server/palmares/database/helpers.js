const path = require('path')
const fs = require('fs')
const models = require('./models')
const { doesModuleExist } = require('../utils')
/**
 * Converts a camelCase string to a snake case string formatting, really easy.
 * 
 * @param {String} string - The string to convert from camel to snake
 * 
 * @returns {String} - The converted string. 
 */
function camelToSnakeCase(string) {
    return string.replace(/[A-Z]+/g, letter => `_${letter.toLowerCase()}`)
}


function retrieveMigrations(settings, databaseName) {
    let migrations = []
    for (let i=0; i< settings.INSTALLED_APPS.length; i++) {
        const appName = settings.INSTALLED_APPS[i]
        const fullPath = path.join(settings.BASE_PATH, appName, 'migrations')
        if (doesModuleExist(fullPath)) {
            fs.readdirSync(fullPath).forEach(file => {
                try {
                    const migration = require(path.join(fullPath,file))
                    const isMigrationFileAValidMigration = typeof migration === 'object' && 
                        migration?.dependency !== undefined && 
                        migration?.operations !== undefined &&
                        migration?.databaseName === databaseName
                    if (isMigrationFileAValidMigration) {
                        migrations.push({
                            appName: appName,
                            migrationName: file.replace('.js', ''),
                            migration: migration
                        })
                    }
                } catch {}
            })
        }
    }
    return migrations
}

/**
 * Retrieves all of the models of the installed apps
 * 
 * @param {*} settings 
 * @returns {Array<object>}
 */
function retrieveModels(settings) {
    let modules = []
    for (let i=0; i< settings.INSTALLED_APPS.length; i++) {
        const appName = settings.INSTALLED_APPS[i]
        let models = []
        try {
            models = Object.values(require(appName))
        } catch (e) {
            const fullPath = path.join(settings.BASE_PATH, appName, 'models')
            if (doesModuleExist(fullPath)) {
                models = Object.values(require(fullPath))
            }
        }

        models.forEach(model => {
            modules.push({ 
                appName: appName,
                model: model
            })
        })
    }
    return modules
}

/**
 * When we load the state the state is not initialized, this means it does not pass through the engine, since the engine itself
 * can add new parameters or arguments we need to initialize it so the comparison between the state and the original models are more
 * "real". 
 * 
 * @param {Object} stateModels - And object where each key is the name of the state model and the value is the actual model defined.
 * @param {Object} engineInstance - The instance of the engine, for example sequelize engine.
 * 
 * @returns {Object} - Returns an object similar to stateModels besides that this will be an object of the initialized models
 */
function initializedStateModelsByModelName(stateModels, engineInstance) {
    const newStateModels = {}
    // reset the defined models so it doesn't clash with the original models.
    engineInstance.resetModels()
    const stateModelEntries = Object.entries(stateModels)

    for (const [stateModelName, stateModel] of stateModelEntries) {
        const isModelStateFromCurrentEngine = stateModel.options.databases.includes(engineInstance.databaseIdName)
        if (isModelStateFromCurrentEngine) {
            class StateModel extends models.Model {
                attributes = stateModel.attributes

                options = stateModel.options
            }

            const stateModelInstance = new StateModel()
            const initializedInstance = stateModelInstance.initialize(
                StateModel, engineInstance, `${stateModelName}`
            )
            const isInitializedInstanceValid = ![null, undefined].includes(initializedInstance)
            if (isInitializedInstanceValid) {
                newStateModels[stateModelName] = {
                    original: StateModel,
                    initialized: initializedInstance
                }
            }
        }
    }
    
    return newStateModels
}

module.exports = {
    initializedStateModelsByModelName,
    retrieveMigrations,
    retrieveModels,
    camelToSnakeCase
}