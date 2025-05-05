'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('BombsData', {
            id: {
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                type: Sequelize.INTEGER,
            },
            varId: {
                allowNull: false,
                type: Sequelize.INTEGER,
                references: {
                    model: 'InfluxVars',
                    key: 'id',
                },
            },
            chartId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Charts',
                    key: 'id',
                },
            },
            name: {
                allowNull: false,
                type: Sequelize.STRING,
            },
            type: {
                allowNull: false,
                type: Sequelize.ENUM,
                values: ['pump', 'status'],
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
         */
        await queryInterface.dropTable('BombsData')
    },
}
