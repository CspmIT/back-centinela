'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        /**
         * Add altering commands here.
         *
         * Example:
         * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
         */
        await queryInterface.createTable('PLCProfile', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            topic: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            influx: {
                type: Sequelize.ENUM([
                    'Sensors_Morteros_Interna',
                    'Sensors_Externos',
                    'externos',
                ]),
                allowNull: false,
            },
            PLCModel: {
                type: Sequelize.ENUM(['LOGO_7', 'LOGO_8', 'S7_1200']),
                allowNull: false,
            },
            ip: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            serviceName: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            rack: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            slot: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            status: {
                type: Sequelize.INTEGER,
                allowNull: false,
                comment:
                    '0 = desactivado - 1 = activo - 2 = desactivado y eliminado',
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
        })
        // Add hooks to handle created_at and updated_at
        queryInterface.sequelize.addHook('beforeCreate', (instance) => {
            instance.createdAt = new Date()
            instance.updatedAt = new Date()
        })

        queryInterface.sequelize.addHook('beforeUpdate', (instance) => {
            instance.updatedAt = new Date()
        })
    },

    async down(queryInterface, Sequelize) {
        /**
         * Add reverting commands here.
         *
         * Example:
         * await queryInterface.dropTable('users');
         */
        await queryInterface.dropTable('PLCProfile')
    },
}
