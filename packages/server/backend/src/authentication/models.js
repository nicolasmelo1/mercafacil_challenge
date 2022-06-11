const { models } = require('../../../palmares/database')


class MacapaContacts extends models.Model {
    attributes = {
        name: new models.fields.CharField({ maxLength: 200 }),
        celular: new models.fields.CharField({ maxLength: 20 }),
    }
    
    options = {
        tableName: 'contacts',
        databases: ['macapa']
    }
}


class VarejaoContacts extends models.Model {
    attributes = {
        name: new models.fields.CharField({ maxLength: 100 }),
        celular: new models.fields.CharField({ maxLength: 13 }),
    }

    options = {
        tableName: 'contacts',
        databases: ['varejao']
    }
}

module.exports = {
    MacapaContacts,
    VarejaoContacts,
}