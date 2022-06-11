/**
 * @module config/database/migrations/makemigrations
 * 
 * @description Yes, we've made our very own database migration tooling this is because sequelize by default
 * didn't have a good auto migration tool, so we've made our very own.
 * 
 * TypeORM has a better migration tooling but we want to work our own way not adding the migrations
 * to a single folder but by keeping each migration as closest as possible from the domain.
 */

const { initializedStateModelsByModelName } = require('../../helpers')
const getState = require('../state')
const { initialize } = require('../../../database')
const getDifference = require('./difference')
const { reorderDifferences } = require('../order')
const generateFiles = require('./generate')
const { PalmaresMigrations } = require('../migrations')
const logger = require('../../../logging')

/**
 * Get the models from the state and from the original models defined in the project.
 * 
 * @param {*} settings 
 */
async function getStateAndOriginalModels(settings) {
    let initializedDatabases = await initialize(settings, [PalmaresMigrations])
    let initializedEngineInstances = []
    const databases = Object.values(initializedDatabases)
    for (const { engineInstance, models: originalModels } of databases) {
        const originalModelsByModelName = {}
        const appNameByModelName = {}
        // automatically generate the models and then define it so we can compare.
        const stateModels = getState(settings, engineInstance.databaseIdName)
        
        const stateModelsByModelName = initializedStateModelsByModelName(stateModels, engineInstance)
        Object.keys(stateModelsByModelName).forEach(stateModelName => {
            stateModelsByModelName[stateModelName] = stateModelsByModelName[stateModelName].original
            appNameByModelName[stateModelName] = stateModels[stateModelName].appName
        })

        originalModels.forEach(({original, appName}) => {
            originalModelsByModelName[original.constructor.name] = original
            appNameByModelName[original.constructor.name] = appName
        })
        
        const initializedEngineInstanceData = {
            engineInstance,
            stateModelsByModelName,
            originalModelsByModelName,
            appNameByModelName
        }
        initializedEngineInstances.push(initializedEngineInstanceData)
    }
    
    return initializedEngineInstances
}

/**
 * The makemigrations work different from django, instead of creating a tree of dependencies we create a list of dependencies.
 * 
 * We think that every migration should follow a straight list instead of a tree. Since we are working with lists, each new migration will have a
 * dependency on the last one. We doesn't care much about the ordering on each project but instead we keep the ordering on the hole project itself, this way it's easy to
 * follow along the migration ordering.
 * 
 * Django offers a per app ordering, which can be helpful working on a single app but easy to lose track on large projects.
 */
async function makemigrations(settings) {
    const initializedEngineInstances = await getStateAndOriginalModels(settings)
    for (
        const { 
            engineInstance, stateModelsByModelName, originalModelsByModelName, appNameByModelName
        } of initializedEngineInstances
    ) {
        const differenceList = await getDifference(appNameByModelName, originalModelsByModelName, stateModelsByModelName)
        const orderedDifferenceList = reorderDifferences(originalModelsByModelName, stateModelsByModelName, differenceList)
        if (orderedDifferenceList.length === 0) {
            logger.INFO.NO_MIGRATION()
        } else {
            generateFiles(engineInstance, settings, orderedDifferenceList)
        }
    }
}

module.exports = makemigrations