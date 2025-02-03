const {combineNonTransactionalMigrations, createAddColumnMigration} = require('../../utils');

module.exports = combineNonTransactionalMigrations(
    createAddColumnMigration('members', 'fcm_token', {
        type: 'string',
        maxlength: 200,
        nullable: true
    })
);
