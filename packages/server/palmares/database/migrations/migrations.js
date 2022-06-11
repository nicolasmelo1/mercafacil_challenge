const models = require("../models")

class PalmaresMigrationsManager extends models.Manager {
    /**
     * Gets the migration that had runned before, this is the last one that was generated.
     * 
     * @param {string} databaseName - The name of the database that we want to get the last migration
     * from.
     * 
     * @returns {Promise<string>} - Retrieves the last migration name that was runned.
     */
    async getLastRunMigrationNameOrderedById(databaseName) {
        const lastMigration = await this.getInstance(databaseName).findOne({
            raw: true,
            attributes: ['migrationName'],
            order: [['id', 'DESC']]
        })

        if (lastMigration) {
            return lastMigration.migrationName
        } else {
            return ''
        }
    }

    /**
     * After a new migration runs we need to save on the database that this migration had runned.
     * 
     * @param {string} databaseName - The name of the database that we want to save the last migration.
     * @param {string} appName - The name of the app were this model was created.
     * @param {string} migrationName - The name of the migration that we want to save.
     */
    async appendNewMigration(databaseName, appName, migrationName) {
        await this.getInstance(databaseName).create({
            app: appName, 
            migrationName: migrationName
        })
    }
}

/**
 * A class for holding the migrations of the application.
 * 
 * This is appended and dependant on SequelizeEngine at the current time but we will soon change 
 * it's dependencies to work on and well with any Engine.
 */
class PalmaresMigrations extends models.Model {
    attributes = {
        createdAt: new models.fields.DatetimeField({autoNowAdd: true}),
        updatedAt: new models.fields.DatetimeField({autoNow: true}),
        app: new models.fields.CharField({maxLength: 280, allowNull: false}),
        migrationName: new models.fields.CharField({maxLength: 500., allowNull: false})
    }

    options = {
        tableName: 'palmares_migrations'
    }

    static migration = new PalmaresMigrationsManager()
}


module.exports = {
    PalmaresMigrations
}