'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('ChartsSeriesData', {
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
            name: {
                type: Sequelize.STRING(255),
                allowNull: false,
            },
            source_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            color: {
                type: Sequelize.STRING(20),
                allowNull: false,
            },
            line: {
                type: Sequelize.ENUM(['line', 'smooth', 'bar', 'scatter']),
                allowNull: false,
            },
            smooth: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
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
        await queryInterface.dropTable('ChartsSeriesData')
    },
}
