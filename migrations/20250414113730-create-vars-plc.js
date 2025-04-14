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
        await queryInterface.createTable('VarsPLC', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            byte: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            bit: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            type: {
                type: Sequelize.ENUM(
                    'BOOL',
                    'BYTE',
                    'INT',
                    'FLOAT',
                    'STRING',
                    'LONG',
                    'DOUBLE'
                ),
                allowNull: false,
            },
            field: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            plcId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'PLCProfile',
                    key: 'id',
                },
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
            status: {
                type: Sequelize.INTEGER,
                allowNull: false,
                comment: '0 = desactivado - 1 = activo',
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
        await queryInterface.dropTable('VarsPLC')
    },
}
