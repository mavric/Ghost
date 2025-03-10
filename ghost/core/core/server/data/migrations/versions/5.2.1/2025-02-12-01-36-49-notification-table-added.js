const { createTransactionalMigration, addTable } = require('../../utils');

module.exports = addTable('notifications', {
    id: { type: 'string', maxlength: 24, nullable: false, primary: true },
    post_id: { type: 'string', maxlength: 24, nullable: true, indexed: true },
    uuid: { type: 'string', maxlength: 36, nullable: false, validations: { isUUID: true } },
    status: {
        type: 'string',
        maxlength: 50,
        nullable: false,
        defaultTo: 'pending',
        validations: { isIn: [['pending', 'submitting', 'submitted', 'failed']] }
    },
    error: { type: 'string', maxlength: 2000, nullable: true },
    error_data: { type: 'text', maxlength: 1000000000, fieldtype: 'long', nullable: true },
    notification_count: { type: 'integer', nullable: true, unsigned: true, defaultTo: 0 },
    delivered_count: { type: 'integer', nullable: true, unsigned: true, defaultTo: 0 },
    failed_count: { type: 'integer', nullable: true, unsigned: true, defaultTo: 0 },
    title: { type: 'string', maxlength: 300, nullable: true },
    message: { type: 'text', maxlength: 1000000000, fieldtype: 'long', nullable: true },
    submitted_at: { type: 'dateTime', nullable: true },
    created_at: { type: 'dateTime', nullable: false },
    created_by: { type: 'string', maxlength: 24, nullable: true },
    updated_at: { type: 'dateTime', nullable: true },
    updated_by: { type: 'string', maxlength: 24, nullable: true }
});

//  module.exports =  addTable('notification_batches', {
//             id: { type: 'string', maxlength: 24, nullable: false, primary: true },
//             notification_id: { type: 'string', maxlength: 24, nullable: false, references: 'notifications.id' },
//             status: {
//                 type: 'string',
//                 maxlength: 50,
//                 nullable: false,
//                 defaultTo: 'pending',
//                 validations: { isIn: [['pending', 'submitting', 'submitted', 'failed']] }
//             },
//             error_status_code: { type: 'integer', nullable: true, unsigned: true },
//             error_message: { type: 'string', maxlength: 2000, nullable: true },
//             error_data: { type: 'text', maxlength: 1000000000, fieldtype: 'long', nullable: true },
//             created_at: { type: 'dateTime', nullable: false },
//             updated_at: { type: 'dateTime', nullable: false }
//         });

// module.exports = addTable('notification_recipients', {
//             id: { type: 'string', maxlength: 24, nullable: false, primary: true },
//             notification_id: { type: 'string', maxlength: 24, nullable: false, references: 'notifications.id' },
//             batch_id: { type: 'string', maxlength: 24, nullable: false, references: 'notification_batches.id' },
//             member_id: { type: 'string', maxlength: 24, nullable: false, indexed: true },
//             token: { type: 'string', maxlength: 255, nullable: false }, // FCM token
//             processed_at: { type: 'dateTime', nullable: true },
//             delivered_at: { type: 'dateTime', nullable: true },
//             failed_at: { type: 'dateTime', nullable: true },
//             '@@INDEXES@@': [
//                 ['notification_id', 'delivered_at'],
//                 ['notification_id', 'failed_at']
//             ]
//         });

//         module.exports =  addTable('notification_recipient_failures', {
//             id: { type: 'string', maxlength: 24, nullable: false, primary: true },
//             notification_id: { type: 'string', maxlength: 24, nullable: false, references: 'notifications.id' },
//             notification_recipient_id: { type: 'string', maxlength: 24, nullable: false, references: 'notification_recipients.id' },
//             code: { type: 'integer', nullable: false, unsigned: true },
//             message: { type: 'string', maxlength: 2000, nullable: false },
//             severity: {
//                 type: 'string',
//                 maxlength: 50,
//                 nullable: false,
//                 defaultTo: 'permanent',
//                 validations: { isIn: [['temporary', 'permanent']] }
//             },
//             failed_at: { type: 'dateTime', nullable: false }
//         });
   

//need to execute all

   