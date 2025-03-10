 const { createTransactionalMigration, addTable } = require('../../utils');
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

        module.exports =  addTable('notification_recipient_failures', {
                id: { type: 'string', maxlength: 24, nullable: false, primary: true },
                notification_id: { type: 'string', maxlength: 24, nullable: false, references: 'notifications.id' },
                notification_recipient_id: { 
                    type: 'string', 
                    maxlength: 24, 
                    nullable: false, 
                    references: 'notification_recipients.id', 
                    constraintName: 'fk_failures_recipient' // Shorter FK name
                },
                code: { type: 'integer', nullable: false, unsigned: true },
                message: { type: 'string', maxlength: 2000, nullable: false },
                severity: {
                    type: 'string',
                    maxlength: 50,
                    nullable: false,
                    defaultTo: 'permanent',
                    validations: { isIn: [['temporary', 'permanent']] }
                },
                failed_at: { type: 'dateTime', nullable: false }
            });

   

   