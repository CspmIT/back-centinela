'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('ChartsData', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            chart_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Charts',
                    key: 'id',
                },
            },
            key: {
                type: Sequelize.STRING(255),
                allowNull: false,
            },
            value: {
                type: Sequelize.TEXT,
                allowNull: false,
            },
            label: {
                type: Sequelize.STRING(255),
                allowNull: false,
            },
            source_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'InfluxVars',
                    key: 'id',
                },
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
        })

        // Add hooks to handle created_at and updated_at
        queryInterface.sequelize.addHook('beforeCreate', (instance) => {
            instance.created_at = new Date()
            instance.updated_at = new Date()
        })

        queryInterface.sequelize.addHook('beforeUpdate', (instance) => {
            instance.updated_at = new Date()
        })
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('charts_data')
    },
}
